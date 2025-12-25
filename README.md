# Cybersecurity Chatbot

A standalone Rust microservice powered by Google Gemini AI that helps university students learn cybersecurity concepts and terminology. This service can be integrated into your existing webapp through a REST API or as an embeddable widget.

## 🎯 Features

- 🤖 **AI-Powered Explanations**: Uses Google Gemini 2.5 Flash for intelligent, contextual responses
- 🔒 **Cybersecurity Focused**: Specially trained to explain security concepts and attack types
- 🎨 **Two Integration Methods**: REST API or drop-in widget
- 🐳 **Docker Ready**: Easy deployment with Docker and Docker Compose
- 🚀 **High Performance**: Built with Rust and async/await for maximum efficiency
- 🌐 **CORS Enabled**: Works with any web application
- 📊 **Structured Logging**: Built-in telemetry with tracing

## 📋 Prerequisites

- **Google Gemini API Key**: Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Docker & Docker Compose** (recommended) OR
- **Rust 1.75+** (for local development)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone and configure**
   ```bash
   cd rust-chatbot
   cp .env.example .env
   ```

2. **Add your Gemini API key to `.env`**
   ```bash
   GEMINI_API_KEY=your-api-key-here
   ```

3. **Build and run**
   ```bash
   docker-compose up --build
   ```

The service will be available at `http://localhost:8080`

### Local Development

1. **Install Rust** from [rustup.rs](https://rustup.rs)

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Run the service**
   ```bash
   cargo run --release
   ```

## 🔌 Integration Methods

### Method 1: REST API Integration

Perfect if you want to build a custom UI or integrate the chatbot into your backend.

#### Endpoint: `/api/chat`

**Request:**
```bash
POST http://localhost:8080/api/chat
Content-Type: application/json

{
  "message": "What is SQL injection?"
}
```

**Response:**
```json
{
  "response": "SQL injection is a code injection technique that exploits vulnerabilities in an application's database layer..."
}
```

#### Example: JavaScript/TypeScript

```javascript
async function askChatbot(question) {
  const response = await fetch('http://localhost:8080/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: question }),
  });
  
  const data = await response.json();
  return data.response;
}

// Usage
const answer = await askChatbot('What is a DDoS attack?');
console.log(answer);
```

#### Example: Python

```python
import requests

def ask_chatbot(question):
    response = requests.post(
        'http://localhost:8080/api/chat',
        json={'message': question}
    )
    return response.json()['response']

# Usage
answer = ask_chatbot('What is phishing?')
print(answer)
```

#### Example: Rust

```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct ChatRequest {
    message: String,
}

#[derive(Deserialize)]
struct ChatResponse {
    response: String,
}

async fn ask_chatbot(question: &str) -> Result<String, reqwest::Error> {
    let client = reqwest::Client::new();
    let response = client
        .post("http://localhost:8080/api/chat")
        .json(&ChatRequest {
            message: question.to_string(),
        })
        .send()
        .await?
        .json::<ChatResponse>()
        .await?;
    
    Ok(response.response)
}
```

### Method 2: Embeddable Widget Integration

Drop-in chatbot with a beautiful UI that requires zero frontend work!

#### Add this single line to your HTML:

```html
<!-- Before closing </body> tag -->
<script src="http://localhost:8080/widget.js"></script>
```

#### Custom API URL (for production)

If your chatbot service is hosted elsewhere, configure the API URL:

```html
<script>
  window.CHATBOT_API_URL = 'https://your-chatbot-service.com';
</script>
<script src="https://your-chatbot-service.com/widget.js"></script>
```

#### Widget Features

- 🎨 Modern, responsive UI
- 💬 Floating chat button in bottom-right corner
- 🌊 Smooth animations and transitions
- 📱 Mobile-friendly design
- ⌨️ Keyboard shortcuts (Enter to send)
- 💭 Typing indicators
- 🎯 No dependencies required

## 🛠️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/api/chat` | POST | Chat with the AI assistant |
| `/widget.js` | GET | Widget JavaScript file |
| `/static/*` | GET | Static files (if any) |

## 🐳 Docker Deployment

### Build the image

```bash
docker build -t cybersecurity-chatbot .
```

### Run the container

```bash
docker run -d \
  -p 8080:8080 \
  -e GEMINI_API_KEY=your-api-key \
  --name chatbot \
  cybersecurity-chatbot
```

### Production Deployment

For production, consider:

1. **Use HTTPS**: Put behind a reverse proxy (nginx, Caddy, Traefik)
2. **Environment Variables**: Store API keys securely (secrets management)
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Monitoring**: Set up logging and monitoring (Prometheus, Grafana)
5. **Scaling**: Run multiple instances behind a load balancer

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | *(required)* | Google Gemini API key |
| `PORT` | `8080` | Port to run the service on |
| `RUST_LOG` | `info` | Log level (trace, debug, info, warn, error) |

### Customizing the System Prompt

Edit `src/gemini.rs` to customize how the AI responds:

```rust
let system_instruction = Content::text(
    "Your custom system prompt here..."
);
```

## 📊 Testing

### Test the API

```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is a firewall?"}'
```

### Run unit tests

```bash
cargo test
```

## 🤝 Integration Examples

### Example: Add to a React App

```jsx
import { useState } from 'react';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const askBot = async () => {
    const response = await fetch('http://localhost:8080/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question }),
    });
    const data = await response.json();
    setAnswer(data.response);
  };

  return (
    <div>
      <input 
        value={question} 
        onChange={(e) => setQuestion(e.target.value)} 
      />
      <button onClick={askBot}>Ask</button>
      <p>{answer}</p>
    </div>
  );
}
```

### Example: Add Widget to Any Webapp

Simply add the script tag before `</body>`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Cybersecurity Course</title>
</head>
<body>
    <h1>Welcome to Cybersecurity 101</h1>
    <p>Course content here...</p>
    
    <!-- Chatbot Widget -->
    <script src="http://localhost:8080/widget.js"></script>
</body>
</html>
```

## 🔒 Security Considerations

- **API Key**: Never expose your Gemini API key in client-side code
- **CORS**: Configure CORS appropriately for production (currently set to allow all origins)
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **HTTPS**: Always use HTTPS in production
- **Input Validation**: The service validates user input, but add additional checks if needed

## 📝 License

MIT License - feel free to use this in your educational projects!

## 🐛 Troubleshooting

### "Failed to connect to chatbot service"

- Ensure the service is running: `docker-compose ps`
- Check the API URL is correct
- Verify CORS settings allow requests from your webapp

### "Invalid API key" or Gemini errors

- Verify your `GEMINI_API_KEY` is set correctly in `.env`
- Check your API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
- Ensure you have quota remaining on your Gemini API account

### Widget not appearing

- Check browser console for errors
- Verify the widget.js script loaded successfully
- Ensure no CSS conflicts with z-index

## 📚 Additional Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Axum Web Framework](https://github.com/tokio-rs/axum)
- [gemini-rust Crate](https://crates.io/crates/gemini-rust)

## 🎓 Example Questions for Testing

Try asking the chatbot:
- "What is SQL injection?"
- "Explain what a DDoS attack is"
- "What is cross-site scripting (XSS)?"
- "How does a man-in-the-middle attack work?"
- "What is Trojan Horse"

---

Built with ❤️ using Rust and Google Gemini AI for cybersecurity education.

