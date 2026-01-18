# Vercel CLI Reference

Use the Vercel CLI to check deployment status, debug issues, and manage deployments.

## Authentication

The CLI is authenticated as user `antonniklasson`. Use `vercel whoami` to verify.

## Checking Deployment Status

### List deployments
```bash
vercel ls                           # List deployments for linked project
vercel ls my-app                    # List deployments for specific project
vercel ls --status READY            # Filter by status (BUILDING, READY, ERROR)
vercel ls --status BUILDING,ERROR   # Filter by multiple statuses
```

### Inspect a deployment
```bash
vercel inspect <url>                # Show deployment info
vercel inspect <url> --logs         # Show build logs
vercel inspect <url> --json         # Output as JSON
vercel inspect <url> --wait         # Block until deployment completes
vercel inspect <url> --wait --timeout 90s  # Wait with custom timeout
```

### View runtime logs
```bash
vercel logs <url>                   # Stream runtime logs (up to 5 min)
vercel logs <url> --json            # Output as JSON (pipe to jq)
vercel logs <url> --json | jq 'select(.level == "warning")'  # Filter warnings
```

## Deploying

```bash
vercel                              # Deploy current directory (preview)
vercel --prod                       # Deploy to production
vercel --force                      # Force new deployment even if unchanged
vercel -e NODE_ENV=production       # Deploy with env vars
vercel --logs                       # Print build logs during deploy
vercel --no-wait                    # Don't wait for completion
```

## Environment Variables

```bash
vercel env list                     # List all env vars
vercel env list production          # List for specific environment
vercel env add NAME                 # Add env var (interactive)
vercel env pull                     # Pull env vars to .env.local
vercel env remove NAME              # Remove env var
vercel env run <command>            # Run command with project env vars
```

## Project Management

```bash
vercel link                         # Link current directory to a project
vercel projects list                # List all projects
vercel project inspect              # Show current project info
vercel open                         # Open project in Vercel dashboard
```

## Debugging Issues

### Find when a bug was introduced
```bash
vercel bisect                       # Interactive bisect
vercel bisect --bad <url>           # Start with known bad deployment
vercel bisect --good <url> --bad <url>  # Specify both endpoints
vercel bisect --run ./test.sh       # Automated with test script
```

### Rollback and recovery
```bash
vercel rollback <url>               # Rollback to previous deployment
vercel redeploy <url>               # Rebuild and deploy a previous deployment
vercel promote <url>                # Promote deployment to production
```

## Useful Patterns

### Check if latest deployment succeeded
```bash
vercel ls --status ERROR            # Show failed deployments
```

### Get deployment URL after deploy
```bash
vercel > deployment-url.txt         # Write URL to file
```

### Debug build failures
```bash
vercel inspect <url> --logs         # View build logs for failed deployment
```
