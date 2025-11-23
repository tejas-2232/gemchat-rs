# Helper Chatbot - Docker Hub Deployment

## For Administrators/Professors

This cybersecurity AI chatbot is available as a Docker container for easy deployment.

### Prerequisites
- Docker installed (https://docs.docker.com/get-docker/)
- Google Gemini API Key (get from https://aistudio.google.com/app/apikey)

### Quick Start

#### Step 1: Pull the Docker Image

```bash
docker pull yourusername/helper-chatbot:latest
```

Replace `yourusername` with the actual Docker Hub username.

#### Step 2: Run the Container

```bash
docker run -d \
  --name helper-chatbot \
  -p 8080:8080 \
  -e GEMINI_API_KEY=your-api-key-here \
  -e PORT=8080 \
  -e RUST_LOG=info \
  --restart unless-stopped \
  yourusername/helper-chatbot:latest
```

**Important:** Replace `your-api-key-here` with your actual Gemini API key.

#### Step 3: Verify It's Running

```bash
# Check container status
docker ps

# Check logs
docker logs helper-chatbot

# Test health endpoint
curl http://localhost:8080/health
```

You should see: `{"status":"healthy","service":"cybersecurity-chatbot"}`

### Integration with Your Webapp

#### Option A: Embeddable Widget (Easiest)

Add this script tag to your HTML pages:

```html
<script src="http://localhost:8080/widget.js"></script>
```

For remote servers, update the URL:
```html
<script>
  window.CHATBOT_API_URL = 'http://your-server-ip:8080';
</script>
<script src="http://your-server-ip:8080/widget.js"></script>
```

#### Option B: REST API

```javascript
fetch('http://localhost:8080/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'What is SQL injection?' })
})
.then(r => r.json())
.then(data => console.log(data.response));
```

### Available Endpoints

- `GET /health` - Health check
- `POST /api/chat` - Send questions (JSON: `{"message": "your question"}`)
- `GET /widget.js` - Embeddable widget JavaScript

### Container Management

**View Logs:**
```bash
docker logs helper-chatbot
docker logs -f helper-chatbot  # Follow logs in real-time
```

**Stop the Container:**
```bash
docker stop helper-chatbot
```

**Start the Container:**
```bash
docker start helper-chatbot
```

**Restart the Container:**
```bash
docker restart helper-chatbot
```

**Remove the Container:**
```bash
docker stop helper-chatbot
docker rm helper-chatbot
```

**Update to Latest Version:**
```bash
docker stop helper-chatbot
docker rm helper-chatbot
docker pull yourusername/helper-chatbot:latest
# Then run Step 2 again
```

### Troubleshooting

**Container exits immediately:**
- Check if GEMINI_API_KEY is set correctly
- View logs: `docker logs helper-chatbot`

**Port already in use:**
- Change port mapping: `-p 3000:8080` (use port 3000 externally)

**Can't access from other machines:**
- Check firewall settings
- Use `0.0.0.0:8080:8080` for port binding
- Or set up nginx/Apache reverse proxy

**Rate limiting errors:**
- Free tier: 15 requests/minute
- Monitor usage: https://ai.dev/usage

### System Requirements

- Docker 20.10+
- 512MB RAM minimum
- 1GB disk space
- Internet connection for Gemini API

### Docker Hub Repository

Image: `yourusername/helper-chatbot`
- Latest stable: `latest` tag
- Specific version: `v1.0` tag

### Example: Run on Different Port

```bash
docker run -d \
  --name helper-chatbot \
  -p 3000:8080 \
  -e GEMINI_API_KEY=your-key \
  yourusername/helper-chatbot:latest
```

Access at: http://localhost:3000

### Support

For issues or questions, refer to the README.md or contact the developer.




