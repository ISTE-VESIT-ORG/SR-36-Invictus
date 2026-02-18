# Learning Module Setup Guide

## Overview
The learning modules now feature AI-generated educational content powered by OpenRouter API. When users click "Start Learning" on any module, they'll be directed to a dedicated page with comprehensive, personalized learning content.

## Features
- ✅ Individual pages for each learning module
- ✅ AI-generated educational content using OpenRouter API
- ✅ Beautiful markdown rendering with proper styling
- ✅ Loading states and error handling
- ✅ Print/Save as PDF functionality
- ✅ Authentication protected routes

## Setup Instructions

### 1. Get OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up or log in to your account
3. Navigate to Settings → API Keys
4. Create a new API key
5. Copy the API key

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your OpenRouter API key to `.env.local`:
   ```env
   OPENROUTER_API_KEY=your_actual_api_key_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. Make sure all other environment variables (Firebase, etc.) are also configured

### 3. Available Learning Modules

The following modules are available:
- **Solar System Basics** (Beginner - 30 min)
- **Satellite Technology** (Intermediate - 45 min)
- **Space Exploration History** (Beginner - 1 hour)
- **Astrophysics Fundamentals** (Advanced - 2 hours)

### 4. API Model Configuration

The implementation uses `meta-llama/llama-3.1-8b-instruct:free` which is a free model on OpenRouter. You can change the model in:

**File**: `app/api/learning-content/route.ts`

```typescript
model: 'meta-llama/llama-3.1-8b-instruct:free', // Change this to any OpenRouter model
```

Popular alternatives:
- `anthropic/claude-3-haiku` (Fast and efficient)
- `openai/gpt-3.5-turbo` (Good balance)
- `google/gemini-pro` (Free with limits)

### 5. Testing the Feature

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/learn`

3. Log in if not already authenticated

4. Click "Start Learning" on any module

5. Wait for the AI to generate content (usually 5-10 seconds)

6. Explore the generated educational content

### 6. Troubleshooting

**Error: "API configuration error"**
- Make sure `OPENROUTER_API_KEY` is set in `.env.local`
- Restart the development server after adding environment variables

**Error: "Failed to generate content"**
- Check your OpenRouter API key is valid
- Verify you have credits/quota available on OpenRouter
- Check the browser console for detailed error messages

**Content not loading**
- Check network tab in browser dev tools
- Verify the API route is responding at `/api/learning-content`
- Check server logs for errors

**Rate limiting errors**
- OpenRouter free tier has rate limits
- Consider using a paid plan or implementing caching

### 7. Customization

#### Modify Content Generation Prompt
Edit the prompt in `app/api/learning-content/route.ts`:

```typescript
const prompt = `Your custom prompt here...`;
```

#### Adjust Styling
Modify ReactMarkdown components in `app/learn/[moduleId]/page.tsx`:

```typescript
components={{
    h1: ({ node, ...props }) => (
        <h1 className="your-custom-classes" {...props} />
    ),
    // ... other components
}}
```

#### Add More Modules
Edit `app/learn/page.tsx` and add new modules to the array:

```typescript
{
    id: 'your-module-id',
    title: 'Your Module Title',
    icon: '🌟',
    level: 'Beginner',
    duration: '30 min',
    topics: ['Topic 1', 'Topic 2'],
    description: 'Your description',
}
```

## File Structure

```
app/
├── api/
│   └── learning-content/
│       └── route.ts           # OpenRouter API integration
├── learn/
│   ├── page.tsx              # Learning modules listing
│   ├── LearnClient.tsx       # Auth wrapper
│   └── [moduleId]/
│       └── page.tsx          # Individual module page
```

## Dependencies Added

- `react-markdown`: For rendering markdown content with proper styling

## Security Notes

- API key is server-side only (never exposed to client)
- Routes are protected with authentication
- Environment variables should never be committed to git
- Add `.env.local` to `.gitignore` if not already present

## Next Steps

Consider implementing:
- [ ] Content caching to reduce API calls
- [ ] Progress tracking for completed modules
- [ ] Quiz generation based on content
- [ ] Certificate generation upon completion
- [ ] User feedback on generated content
- [ ] Content regeneration option
- [ ] Offline mode with pre-generated content

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review OpenRouter documentation
3. Check browser console for errors
4. Verify all environment variables are set correctly
