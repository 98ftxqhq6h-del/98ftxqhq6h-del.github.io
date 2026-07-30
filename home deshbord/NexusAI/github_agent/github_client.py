import httpx
import os
import logging
import base64

logger = logging.getLogger("nexus-github-agent")

class GitHubAgent:
    def __init__(self, pat: str = None, enabled: bool = True):
        self.pat = pat or os.getenv("GITHUB_PAT")
        self.enabled = enabled
        self.headers = {
            "Authorization": f"token {self.pat}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Nexus-AI-Desktop-OS"
        }
        self.simulated = not self.pat or "your_github_personal" in self.pat

    def check_status(self) -> str:
        if not self.enabled:
            return "DISABLED"
        return "SIMULATION" if self.simulated else "ACTIVE"

    async def execute_action(self, action_type: str, details: dict) -> dict:
        if not self.enabled:
            return {"status": "error", "message": "GitHub Agent is disabled."}
        if self.simulated:
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
                return {"status": "error", "message": f"Action {action_type} unsupported."}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def create_repo(self, repo_name: str, private: bool = True) -> dict:
        url = "https://api.github.com/user/repos"
        payload = {"name": repo_name, "private": private, "description": "Created via Nexus AI Assistant"}
        
        async with httpx.AsyncClient() as client:
            res = await client.post(url, headers=self.headers, json=payload)
            if res.status_code == 201:
                return {"status": "success", "url": res.json()["html_url"], "message": f"Repo '{repo_name}' created."}
            return {"status": "error", "message": res.text}

    async def commit_file(self, repo: str, path: str, content: str, msg: str) -> dict:
        url = f"https://api.github.com/repos/{repo}/contents/{path}"
        sha = None
        
        async with httpx.AsyncClient() as client:
            get_resp = await client.get(url, headers=self.headers)
            if get_resp.status_code == 200:
                sha = get_resp.json()["sha"]
                
        encoded = base64.b64encode(content.encode("utf-8")).decode("utf-8")
        payload = {"message": msg, "content": encoded}
        if sha:
            payload["sha"] = sha
            
        async with httpx.AsyncClient() as client:
            put_resp = await client.put(url, headers=self.headers, json=payload)
            if put_resp.status_code in [200, 201]:
                return {"status": "success", "message": f"File '{path}' committed."}
            return {"status": "error", "message": put_resp.text}

    async def list_issues(self, repo: str) -> dict:
        url = f"https://api.github.com/repos/{repo}/issues"
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers=self.headers)
            if res.status_code == 200:
                issues = [{"number": i["number"], "title": i["title"], "state": i["state"]} for i in res.json()[:5]]
                return {"status": "success", "issues": issues}
            return {"status": "error", "message": res.text}

    async def check_ci_status(self, repo: str) -> dict:
        url = f"https://api.github.com/repos/{repo}/actions/runs"
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers=self.headers)
            if res.status_code == 200:
                runs = res.json().get("workflow_runs", [])
                if not runs:
                    return {"status": "success", "ci_status": "none"}
                return {
                    "status": "success",
                    "ci_status": runs[0]["status"],
                    "conclusion": runs[0]["conclusion"],
                    "commit": runs[0].get("head_commit", {}).get("message")
                }
            return {"status": "error", "message": res.text}

    async def _execute_simulation(self, action_type: str, details: dict) -> dict:
        import asyncio
        await asyncio.sleep(0.4)
        if action_type == "create_repo":
            name = details.get("name", "nexus-module")
            return {"status": "success", "url": f"https://github.com/simulated/{name}", "message": f"[SIMULATED] Repository '{name}' created."}
        elif action_type == "commit_file":
            path = details.get("path", "main.py")
            return {"status": "success", "message": f"[SIMULATED] File '{path}' committed successfully."}
        elif action_type == "list_issues":
            return {"status": "success", "issues": [{"number": 42, "title": "[Simulated] Fix metal shader compile limits", "state": "open"}]}
        elif action_type == "check_ci":
            return {"status": "success", "ci_status": "completed", "conclusion": "success", "commit": "[Simulated] Integrated whisper.cpp voice parser"}
        return {"status": "error", "message": "Simulated action missing."}
