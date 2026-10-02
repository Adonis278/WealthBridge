# GCP Secret Manager setup for OPENAI_API_KEY

This guide shows how to store the `OPENAI_API_KEY` in Google Cloud Secret Manager and access it from Cloud Functions / Node services and locally.

Prerequisites
- Install and authenticate the Google Cloud SDK: `gcloud auth login` and `gcloud config set project YOUR_PROJECT_ID`.
- Ensure you have permission to create secrets (roles/secretmanager.admin) or ask an admin.

1) Create the secret and add the key value
```bash
gcloud secrets create OPENAI_API_KEY --replication-policy="automatic" --project=YOUR_PROJECT_ID
# Add the secret value (from your local copy)
echo -n "sk-REPLACE_WITH_YOUR_KEY" | gcloud secrets versions add OPENAI_API_KEY --data-file=- --project=YOUR_PROJECT_ID
```

2) Grant access to the runtime service account
- For Cloud Functions: grant the Cloud Functions service account access:
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:YOUR_FUNCTIONS_SA@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```
- For Cloud Run or other runtimes, use the corresponding service account.

3) Access the secret from Node.js at runtime
Install the client library where your server runtime runs (e.g., in `functions`):

```bash
npm install @google-cloud/secret-manager
```

Code snippet (TypeScript / Node):

```ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

const client = new SecretManagerServiceClient()

export async function accessSecret(secretName: string, projectId: string) {
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`
  const [version] = await client.accessSecretVersion({ name })
  const payload = version.payload?.data?.toString('utf8') || ''
  return payload
}

// Usage
// const openaiKey = await accessSecret('OPENAI_API_KEY', process.env.GCP_PROJECT)
```

4) Local development: fetch secret into local `.env.local` (keeps local copy only)
- Option A: use `gcloud` to read directly and update `Wealth-Bridge/.env.local`:

```powershell
# PowerShell example
$val = gcloud secrets versions access latest --secret=OPENAI_API_KEY --project=YOUR_PROJECT_ID
( Get-Content Wealth-Bridge/.env.local ) -replace '^OPENAI_API_KEY=.*','OPENAI_API_KEY='+$val | Set-Content Wealth-Bridge/.env.local
```

- Option B: use the included helper `scripts/fetch_secret_to_env.ps1` which runs `gcloud` and writes the key into `Wealth-Bridge/.env.local` (keeps local copy only).

5) Rotate and revoke
- To rotate, add a new secret version and update consumers if you pin versions.
- To revoke, `gcloud secrets versions destroy VERSION --secret=OPENAI_API_KEY`

Security notes
- Never commit secrets to git.
- Use least-privilege service accounts and monitor access logs.
- Consider using Secret Manager with CMEK for additional protection.
