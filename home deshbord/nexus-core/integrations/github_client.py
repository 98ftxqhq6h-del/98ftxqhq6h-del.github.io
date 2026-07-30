import httpx
import os
import logging
import base64

logger = logging.getLogger("nexus-core")

class GitHubClient:
    def __init__(self, pat: str = None, enabled: bool = True):
        self.pat = pat or os.getenv("GITHUB_PAT")
        self.enabled = enabled
        self.headers = {
            "Authorization": f"token {self.pat}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Nexus-Jarvis-OS"
        }
        
        # Check if running in simulation mode
        self.simulated = not self.pat or "your_github_personal" in self.pat

    def check_status(self) -> str:
        if not self.enabled:
            return "DISABLED"
        return "SIMULATION" if self.simulated else "ACTIVE"

    async def execute_action(self, action_type: str, details: dict) -> dict:
        """
        Executes a GitHub action based on the intent parsed.
        """
        if not self.enabled:
            return {"status": "error", "message": "GitHub Integration is disabled in config.yaml."}
            
        if self.simulated:
            logger.info(f"GitHub Client running in [SIMULATION] for action: {action_type}")
            return await self._execute_simulation(action_type, details)
            
        try:
            if action_type == "create_repo":
                return await self.create_repo(details.get("name"), details.get("private", True))
            elif action_type == "commit_file":
                return await self.commit_file(
                    details.get("repo"),
                    details.get("path"),
                    details.get("content"),
                    details.get("message", "Nexus automatic commit")
                )
            elif action_type == "list_issues":
                return await self.list_issues(details.get("repo"))
            elif action_type == "check_ci":
                return await self.check_ci_status(details.get("repo"))
            else:
                return {"status": "error", "message": f"Unsupported GitHub action: {action_type}"}
        except Exception as e:
            logger.error(f"GitHub client error: {str(e)}")
            return {"status": "error", "message": str(e)}

    async def create_repo(self, repo_name: str, private: bool = True) -> dict:
        url = "https://api.github.com/user/repos"
        payload = {
            "name": repo_name,
            "private": private,
            "description": "Created automatically via Nexus Jarvis OS Command Center"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=payload)
            if response.status_code == 201:
                data = response.json()
                return {"status": "success", "url": data["html_url"], "message": f"Repo {repo_name} created successfully."}
            return {"status": "error", "message": f"GitHub returned {response.status_code}: {response.text}"}

    async def commit_file(self, repo_full_name: str, file_path: str, content: str, commit_message: str) -> dict:
        # e.g., repo_full_name = "anurag-nexus/test-repo"
        url = f"https://api.github.com/repos/{repo_full_name}/contents/{file_path}"
        
        # Check if file exists first to get the sha
        sha = None
        async with httpx.AsyncClient() as client:
            get_resp = await client.get(url, headers=self.headers)
            if get_resp.status_code == 200:
                sha = get_resp.json()["sha"]
                
        # Base64 encode file content
        encoded_content = base64.b64encode(content.encode("utf-8")).decode("utf-8")
        payload = {
            "message": commit_message,
            "content": encoded_content
        }
        if sha:
            payload["sha"] = sha
            
        async with httpx.AsyncClient() as client:
            put_resp = await client.put(url, headers=self.headers, json=payload)
            if put_resp.status_code in [200, 201]:
                return {"status": "success", "message": f"File {file_path} committed successfully."}
            return {"status": "error", "message": f"GitHub commit returned {put_resp.status_code}: {put_resp.text}"}

    async def list_issues(self, repo_full_name: str) -> dict:
        url = f"https://api.github.com/repos/{repo_full_name}/issues"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 200:
                issues = response.json()
                parsed_issues = [{"number": i["number"], "title": i["title"], "state": i["state"]} for i in issues[:5]]
                return {"status": "success", "issues": parsed_issues}
            return {"status": "error", "message": f"GitHub returned {response.status_code}: {response.text}"}

    async def check_ci_status(self, repo_full_name: str) -> dict:
        url = f"https://api.github.com/repos/{repo_full_name}/actions/runs"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 200:
                runs = response.json().get("workflow_runs", [])
                if not runs:
                    return {"status": "success", "ci_status": "No workflow runs found."}
                latest = runs[0]
                return {
                    "status": "success",
                    "ci_status": latest.get("status"),
                    "conclusion": latest.get("conclusion"),
                    "commit": latest.get("head_commit", {}).get("message")
                }
            return {"status": "error", "message": f"GitHub returned {response.status_code}: {response.text}"}

    async def _execute_simulation(self, action_type: str, details: dict) -> dict:
        """
        Mock simulation outputs if GITHUB_PAT is not yet provided.
        """
        import asyncio
        await asyncio.sleep(0.5) # simulate latency
        
        if action_type == "create_repo":
            name = details.get("name", "nexus-simulated-repo")
            return {
                "status": "success",
                "url": f"https://github.com/simulated-owner/{name}",
                "message": f"[SIMULATION] Repository '{name}' created successfully."
            }
        elif action_type == "commit_file":
            path = details.get("path", "file.txt")
            repo = details.get("repo", "owner/repo")
            return {
                "status": "success",
                "message": f"[SIMULATION] File '{path}' committed successfully to repository '{repo}'."
            }
        elif action_type == "list_issues":
            return {
                "status": "success",
                "issues": [
                    {"number": 101, "title": "[Simulated] Fix local model connection flutter", "state": "open"},
                    {"number": 99, "title": "[Simulated] Clean dashboard card CSS grids", "state": "closed"}
                ]
            }
        elif action_type == "check_ci":
            return {
                "status": "success",
                "ci_status": "completed",
                "conclusion": "success",
                "commit": "[Simulated] Refactored core intent classifier"
            }
        return {"status": "error", "message": "Unknown action target."}
