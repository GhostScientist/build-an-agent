# Android Agent - Installation & Usage

## Quick Start

### 1. Set up your Claude API Key

First, you need a Claude API key from Anthropic:

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account or log in
3. Navigate to API Keys
4. Create a new API key

### 2. Install the Android Agent

```bash
# Clone the repository
git clone <your-repo-url>
cd build-an-agent

# Install dependencies
npm install

# Build the project
npm run build

# Configure your API key
node dist/cli.js config --api-key YOUR_API_KEY_HERE

# Or set as environment variable
export ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Test the Installation

```bash
# Quick test with a single question
node dist/cli.js "What are the best practices for Jetpack Compose?"

# Start interactive mode
node dist/cli.js
```

## Usage Examples

### Single Query Mode
```bash
node dist/cli.js "How do I implement DataWedge barcode scanning?"
```

### Interactive Mode
```bash
node dist/cli.js

🤖 Android Agent - Claude Code for Android Development
Type your questions or commands:

android-agent> How do I set up Hilt dependency injection?
android-agent> /scan
android-agent> /help
android-agent> /quit
```

### Available Commands

- **Help**: `/help` - Show available commands
- **Project Analysis**: `/scan` - Analyze current Android project structure
- **Clear History**: `/clear` - Clear conversation history  
- **Configuration**: `/config` - Show current configuration
- **Exit**: `/quit` or Ctrl+C - Exit the agent

### Configuration

```bash
# Set API key
node dist/cli.js config --api-key YOUR_KEY

# Show current config
node dist/cli.js config --show

# Interactive config setup
node dist/cli.js config
```

### Environment Variables

The agent checks for these environment variables:
- `ANTHROPIC_API_KEY` - Your Claude API key
- `CLAUDE_API_KEY` - Alternative API key variable

## What the Agent Can Help With

### ✅ Android Expertise Areas
- **Kotlin Development**: Coroutines, Flow, modern patterns
- **Jetpack Compose**: UI development, state management, navigation
- **Android Architecture**: MVVM, Repository pattern, Dependency Injection
- **DataWedge Integration**: Barcode scanning, RFID, intent handling
- **Build Systems**: Gradle configuration, build variants
- **Testing**: Unit tests, UI tests, instrumentation testing
- **Performance**: Memory optimization, threading, battery usage

### ⚠️ Non-Android Queries
When you ask about topics outside Android development, the agent will:
1. Acknowledge it's specialized for Android
2. Provide a best-effort response with disclaimers
3. Recommend verifying with domain experts
4. Offer to help adapt solutions to Android contexts

## Example Interactions

### Jetpack Compose Help
```bash
android-agent> Create a login form with validation in Jetpack Compose

The agent will provide complete, working Compose code with:
- Modern Material 3 components
- State management patterns
- Validation logic
- Error handling
```

### DataWedge Integration
```bash
android-agent> How do I set up DataWedge for barcode scanning?

The agent will explain:
- DataWedge profile configuration
- Intent filters and broadcast receivers
- Handling scan results in your Activity
- Best practices for enterprise deployment
```

### Project Analysis
```bash
android-agent> /scan

📱 Android Project Analysis:
✅ Android Project Detected
📁 Project Type: multi-module
🏗️ Modules: app, core, data
🎯 Build Variants: debug, release
📦 Key Dependencies:
   • androidx.compose.ui:ui:1.5.4
   • com.symbol.emdk:emdk:9.1.0
   • androidx.hilt:hilt-android:2.48
🎨 Jetpack Compose: Enabled
📱 DataWedge Integration: Detected
⚡ Kotlin Version: 1.9.10
```

## Troubleshooting

### API Key Issues
```bash
❌ No API key found. Please configure your Claude API key first:
   android-agent config --api-key YOUR_API_KEY
   or set environment variable: ANTHROPIC_API_KEY=your_key
```

### Build Issues
```bash
npm run clean
npm install
npm run build
```

### Permission Issues
Make sure you have proper file permissions for the config directory (`~/.android-agent/`)

## Development Mode

For development and testing:

```bash
# Watch mode (rebuilds on changes)
npm run dev

# Test with sample queries
npm test "How do I implement Room database?"
```

## Global Installation (Optional)

To install globally so you can use `android-agent` command anywhere:

```bash
# Link locally for development
npm link

# Then use globally
android-agent "Create a DataWedge profile"
android-agent config --show
android-agent
```

## Next Steps

1. Try asking Android development questions
2. Test the `/scan` command in an Android project directory
3. Explore different types of queries (Compose, DataWedge, architecture)
4. Customize the agent for your specific needs

Happy Android coding! 🤖📱