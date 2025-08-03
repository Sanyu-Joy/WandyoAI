# WandyoAI - The AI Research OS for Everyone

**Democratizing AI research through intelligent collaboration and discovery**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)

##  Vision

WandyoAI transforms the global research landscape by creating the world's first **AI Research Operating System**. We're building a platform where 10 million researchers worldwide can collaborate seamlessly, and 100 million curious minds can participate in advancing human knowledge.

**Our Mission**: Make AI research as accessible as creating a Google Doc, as collaborative as GitHub, and as powerful as a top-tier research lab.

##  Revolutionary Features

###  **"Fork this Paper" Intelligence**
- **AI-Powered Analysis**: Instantly understand any research paper with our 8-model AI system
- **Voice Explanations**: Get ELI5 to expert-level explanations via voice interface
- **Related Work Discovery**: AI finds connected research and collaboration opportunities
- **Code Generation**: Transform research into working implementations

###  **Global Research Collaboration**
- **Real-time Collaboration**: Live editing and discussion on research projects
- **Researcher Matching**: AI connects you with collaborators based on expertise and interests
- **Mentorship Network**: Connect experienced researchers with emerging talent
- **Research Challenges**: Community-driven problem-solving competitions

###  **Advanced AI Research Intelligence**
- **8-Model AI Gateway**: DeepSeek R1, SciBERT, NV-Embed-v2, DeepSeek-Coder-V2, Qwen2.5-72B, Llama-3.1-70B, Mathstral-7B
- **Semantic Search**: Vector-powered discovery across millions of papers
- **Research Feed**: AI-curated personalized research updates
- **Experiment Stories**: Document and share research journeys with AI assistance

##  Technical Architecture

### Backend (NestJS + TypeScript)
```
 Core Services
├──  Authentication & Authorization (JWT + Role-based)
├──  Paper Management System (ArXiv, Semantic Scholar, Papers with Code)
├──  Search & Discovery (Typesense + Vector Search)
├──  AI Model Gateway (8 Specialized Models)
├──  Collaboration Engine (WebSocket + Real-time)
├──  Analytics & Insights
└──  Background Job Processing (BullMQ + Redis)
```

### Frontend (React + TypeScript)
```
 User Experience
├──  Interactive Paper Experience
├──  Voice-First Interface
├──  Global Collaboration Tools
├──  Real-time Research Feed
├──  Research Challenges Platform
└──  Mentorship Network
```

### Data Infrastructure
```
 Storage & Search
├──  PostgreSQL (Primary Database with Drizzle ORM)
├──  Typesense (Fast Search & Autocomplete)
├──  Qdrant (Vector Database for Semantic Search)
├──  Redis (Caching + Queue Management)
└──  Object Storage (File Management)
```

##  Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- Typesense Server
- Qdrant Vector Database

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/wandyoai.git
cd wandyoai
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables:
# - DATABASE_URL (PostgreSQL connection)
# - REDIS_URL (Redis connection)
# - TYPESENSE_API_KEY (Search service)
# - QDRANT_URL (Vector database)
# - JWT_SECRET (Authentication)
```

### 3. Database Setup
```bash
# Push database schema
npm run db:push

# Seed initial data (optional)
npm run db:seed
```

### 4. Start Development Environment
```bash
# Start all services
npm run dev

# Or start individually:
npm run backend:dev    # Backend server (port 5000)
npm run frontend:dev   # Frontend server (port 3000)
```

### 5. Access the Platform
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

##  Available Scripts

### Development
```bash
npm run dev              # Start all services
npm run backend:dev      # Backend only
npm run frontend:dev     # Frontend only
npm run db:push          # Update database schema
npm run db:studio        # Open database studio
```

### Production
```bash
npm run build           # Build for production
npm run start           # Start production server
npm run test            # Run test suite
npm run lint            # Code linting
```

##  API Examples

### Paper Discovery
```typescript
// Search papers with AI-powered filters
GET /api/papers/search?q=machine+learning&filters={"year":"2024","category":"cs.AI"}

// Get AI analysis of a paper
POST /api/papers/analyze
{
  "paperUrl": "https://arxiv.org/abs/2024.12345",
  "analysisType": "comprehensive"
}
```

### AI Research Assistant
```typescript
// Generate research insights
POST /api/ai/research-insights
{
  "paperId": "paper_123",
  "insightType": "related_work",
  "depth": "expert"
}

// Voice explanation generation
POST /api/ai/voice-explanation
{
  "content": "paper abstract or section",
  "level": "eli5", // eli5, undergraduate, graduate, expert
  "language": "en"
}
```

### Collaboration
```typescript
// Create research collaboration
POST /api/collaborations
{
  "title": "Multi-modal AI Research Project",
  "description": "Exploring cross-modal learning",
  "isPublic": true,
  "inviteEmails": ["researcher@university.edu"]
}

// Real-time collaboration updates via WebSocket
ws://localhost:5000/ws/collaboration/{collaborationId}
```

##  Roadmap

###  **Phase 1: Foundation** *(Completed)*
- ✅ Core platform architecture
- ✅ Multi-source paper ingestion
- ✅ Advanced search and discovery
- ✅ 8-model AI integration
- ✅ Real-time collaboration
- ✅ Revolutionary social features

###  **Phase 2: User Experience Revolution** *(Q1 2025)*
-  Advanced voice interfaces with conversation memory
-  Mobile-first research assistant app
-  Multi-language support (10+ languages)
-  Personalized research dashboards
-  Advanced analytics and insights

###  **Phase 3: Global Collaboration** *(Q2-Q3 2025)*
-  University and institution partnerships
-  Research competition platform
-  Expert mentorship marketplace
-  Virtual research labs
-  Publication and peer review system

###  **Phase 4: AI Research Democratization** *(Q4 2025-Q1 2026)*
-  AI research agent with autonomous capabilities
-  Automated experiment design and execution
-  Predictive research trend analysis
-  Enterprise research workflow automation
-  Open science initiative and data sharing

###  **Phase 5: Market Expansion** *(2026)*
-  Enterprise research solutions
-  Educational institution licensing
-  Government and policy research tools
-  Industry-academia collaboration platform
-  Research funding and grant marketplace

##  Business Model

### Revenue Streams
- **Freemium SaaS**: $19-199/month per user
- **Enterprise Licensing**: $50K-500K annually
- **University Partnerships**: Site licenses and custom solutions
- **AI Services**: API access and white-label solutions

### Market Opportunity
- **TAM**: $50B+ global research and collaboration market
- **SAM**: $10B AI-powered research tools and platforms
- **SOM**: $500M ARR potential by year 5
- **Users**: 10M+ researchers expanding to 100M+ curious minds

##  Competitive Advantages

1. **Only platform combining research discovery with social networking**
2. **8-model AI integration for comprehensive research intelligence**
3. **Real-time global collaboration with conflict resolution**
4. **Voice-first interface for accessibility and convenience**
5. **Open science approach with emerging market focus**

##  Contributing

We welcome contributions from the global research community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- Research community for inspiration and feedback
- Open source AI models powering our intelligence layer
- Y Combinator for supporting ambitious research democratization

##  Contact

**Founder & CEO**: David Sanyu  
**Email**: sanyudavid20@gmail.com
**Website**: https://wandyoai.com (To be our domain name) 
**Y Combinator Application**: Winter 2025

---

**Building the future of AI research, one collaboration at a time.** 🚀

*WandyoAI - Where curiosity meets intelligence, and research meets the world.*
