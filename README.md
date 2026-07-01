# Car Search Engine (Dekho) - Project Retrospective

## What We Built

**Dekho** ("Look" in Hindi) is an intelligent car recommendation engine that combines rule-based matching with LLM-powered insights. The system takes user preferences (budget, primary use, priority) and returns ranked car recommendations with AI-generated contextual suggestions.

**Core Features:**
- **Smart Matching Algorithm** - Scores cars against user criteria using weighted metrics
- **LLM Integration** - OpenAI API generates contextual purchase recommendations
- **Pre-configured Database** - 10+ company car models with detailed specifications
- **REST API** - Simple POST endpoint for car matching with health checks
- **Configurable LLM Provider** - Architecture supports OpenAI, Google Gemini (via Spring AI)

## Why We Built It This Way

1. **Spring Boot + Spring AI** - Provides clean abstractions for LLM providers without vendor lock-in
2. **Rule-based Matching First** - Ensures deterministic, explainable recommendations before adding AI
3. **Modular Services** - Separate `CarMatchmakerService` and `LLMSuggestionService` for independent testing
4. **In-Memory Database (H2)** - Fast prototyping without infrastructure overhead
5. **JSON Data Loading** - Simple, version-controllable car database

## What We Deliberately Cut it.

| Feature | Reason |
|---------|--------|
| **AI Suggestions (Currently Disabled)** | Cost control + validation phase - can re-enable with `matchCars()` logic change |
| **User Authentication** | Out of scope for MVP - would add Spring Security + JWT |
| **Search/Filter Endpoints** | MVP focuses on match algorithm; advanced search can layer on top |
| **Persistent Database** | H2 in-memory sufficient for demo; could migrate to PostgreSQL |
| **User Profiles** | Requires user management infrastructure not built yet |
| **Caching** | Single request latency acceptable; can add Redis if needed |
| **Pagination** | Top-5 results sufficient; full result set < 100 items |
| **Advanced Scoring** - Predictive ML models | Rule-based scoring performs well enough; ML can be next phase |

## Tech Stack & Rationale

```
┌─ Frontend ──────────────────────────────┐
│ (Future: Angular with REST calls)       │
└──────────────────┬──────────────────────┘
                   │
┌─ Backend API ────────────────────────────────────────┐
│ Spring Boot 3.5.3 (LTS, Java 17)                     │
│ └─ CarMatchmakerController (REST endpoints)          │
│ └─ CarMatchmakerService (matching logic)             │
│ └─ LLMSuggestionService (OpenAI integration)         │
│ └─ CarRepository (JPA data access)                   │
└──────────────────┬───────────────────────────────────┘
                   │
┌─ Data & AI ───────────────────────────────────┐
│ H2 Database (cars.json loaded at startup)     │
│ Spring AI 1.0.1 (OpenAI ChatClient)           │
│ OpenAI API (GPT-3.5-turbo for suggestions)    │ 
└───────────────────────────────────────────────┘
```

**Why These Choices:**

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | Spring Boot | Enterprise standard, mature ecosystem, easy testing |
| **Java Version** | 17 (LTS) | Latest LTS, records, text blocks, strong pattern matching |
| **LLM Framework** | Spring AI | Vendor-agnostic abstractions, easy to swap providers |
| **LLM Model** | GPT-3.5-turbo | Cost-effective, fast, adequate quality for suggestions |
| **Database** | H2 | Zero-config in-memory DB; can swap to PostgreSQL later |
| **Build Tool** | Gradle | Faster than Maven, better dependency management |
| **JSON Library** | Jackson | Spring Boot default, production-proven |

## What We Delegated to AI Tools vs. Did Manually

### Delegated to AI (GitHub Copilot CLI):
✅ **Code Generation (70% efficiency gain)**
- Generated `CarMatchmakerService` class with scoring algorithm
- Created Spring AI integration boilerplate
- Wrote DTO classes with proper Jackson annotations
- Generated `DataLoader` configuration
- Created REST controller stubs

✅ **Configuration Scaffolding**
- `build.gradle` dependency setup (Spring Boot, Spring AI versions)
- `application.properties` with OpenAI/Gemini config templates
- CORS configuration

✅ **Testing Boilerplate**
- JUnit 5 test structure (though tests not yet comprehensive)

### Done Manually:
🔧 **Business Logic Design**
- Matching algorithm weights (safety: +10, efficiency: +8, etc.)
- Match score calculation logic
- Match reason generation

🔧 **API Contract Design**
- Request/Response DTOs with appropriate fields
- Error handling strategy
- Health check endpoint design

🔧 **Integration Architecture**
- Service layer separation
- Decision to disable AI suggestions for cost control
- LLM JSON parsing and fallback strategy

🔧 **Data Modeling**
- Car entity fields (price, safety rating, fuel type, luxury features, etc.)
- Primary use category taxonomy

## Where AI Tools Helped Most

| Task | Impact | How |
|------|--------|-----|
| **Repetitive Boilerplate** | ⭐⭐⭐⭐⭐ | Eliminated 40+ lines of Spring configuration per file |
| **Jackson Annotations** | ⭐⭐⭐⭐ | Correct JSON field names, null handling without research |
| **LLM Prompt Design** | ⭐⭐⭐⭐ | Generated clear JSON format specifications; 2nd attempt perfect |
| **Documentation** | ⭐⭐⭐ | Created SPRING_AI_SETUP.md; saved 20 min of writing |
| **Method Signatures** | ⭐⭐⭐ | Correct Spring annotations (PostConstruct, Value, Autowired) |

## Where AI Tools Got in the Way

| Issue | Severity | Details |
|-------|----------|---------|
| **Over-generated Code** | Medium | Initial service class had 50+ lines of unused methods; required manual cleanup |
| **Generic Matching Logic** | Medium | First algorithm too simple (100% scores); had to manually refine weighting |
| **Missing Error Handling** | Low | AI forgot try-catch around JSON parsing; caught during review |
| **LLM Hallucination** | Low | Suggested Spring Cloud Config (not needed); ignored and used simpler approach |
| **No Business Context** | Low | AI suggested features (caching, pagination) without understanding MVP scope |

**Workaround:** Always specified "MVP-only" and "minimal viable" in prompts after learning this.

## Architecture Decisions Made

```
1. Rule-Based Scoring First (No ML)
   └─ Why: Interpretable results, faster to build, good enough for MVP
   
2. LLM for Suggestions, Not Decisions
   └─ Why: AI enhances UX; matching logic stays deterministic
   
3. Service Layer Pattern
   └─ Why: Testable, swappable (e.g., add PostgreSQL, swap LLM provider)
   
4. Data Loader at Startup
   └─ Why: Simpler than external DB; good for demos
   
5. Gradual AI Integration
   └─ Why: AI suggestions currently disabled; can enable after cost analysis
```

## If We Had 4 More Hours

### Priority 1: Enable AI Suggestions (45 min)
```java
// Current: Line 50 in CarMatchmakerService
List<Map<String, Object>> aiSuggestions = null; 
// Change to:
List<Map<String, Object>> aiSuggestions = getAISuggestions(request);
```
- Test with real OpenAI key
- Measure latency (target: <500ms)
- Add timeout handling

### Priority 2: Add Search Endpoint (45 min)
```
GET /api/car-matchmaker/search?budget=50000&fuelType=Electric&type=SUV
```
- Filter cars without full matching workflow
- Add pagination (page, size params)
- Return list of cars with basic info

### Priority 3: Write Integration Tests (60 min)
```java
- Test CarMatchmakerService with various input combinations
- Mock OpenAI API; test LLMSuggestionService
- Test JSON parsing edge cases
- Achieve 80% code coverage
```

### Priority 4: User Preferences Endpoint (30 min)
```
POST /api/car-matchmaker/preferences/{userId}
GET /api/car-matchmaker/preferences/{userId}
```
- Store match history (add column to Car table)
- Learn which recommendations are clicked

### Priority 5: Containerization (30 min)
```dockerfile
# Use existing Dockerfile with optimizations:
# - Multi-stage build to reduce image size
# - Use java:17-slim base image
# - Test docker build & run
```

### Priority 6: Cost Monitoring (30 min)
```properties
# Add application logging:
- Track OpenAI API calls (prompts, responses, tokens used)
- Set quota alerts
- Calculate cost per match request
- Decide if AI suggestions ROI-positive
```

## Development Notes

### Running the App
```bash
export OPENAI_API_KEY=sk-your-key
./gradlew bootRun
curl http://localhost:8081/api/car-matchmaker/health
```

### Project Structure
```
src/main/java/com/car/dekho/
├── Application.java              # Entry point
├── controller/                   # REST endpoints
├── service/                      # Business logic
├── model/                        # Domain entities
├── repo/                         # Data access (JPA)
├── dto/                          # Request/Response objects
└── config/                       # Spring configuration

src/main/resources/
├── application.properties        # Config
└── cars.json                     # Car database (10 models)
```

### Known Limitations
- AI suggestions currently disabled (cost optimization)
- No pagination on match results
- Scoring algorithm is rule-based (not ML)
- No user authentication
- H2 database resets on app restart
- Single LLM model (OpenAI); Gemini support is template-only

## Future Roadmap

**Phase 2 (1-2 weeks):**
- [ ] Enable AI suggestions with cost monitoring
- [ ] Add comprehensive integration tests
- [ ] Implement search endpoint
- [ ] Deploy to cloud (AWS Lambda / Google Cloud Run)

**Phase 3 (2-4 weeks):**
- [ ] Add user authentication (Spring Security)
- [ ] Save user preferences and search history
- [ ] Build React frontend
- [ ] Add analytics dashboard

**Phase 4 (1 month+):**
- [ ] Migrate H2 → PostgreSQL
- [ ] Implement ML-based scoring (user feedback training)
- [ ] Add image uploads for cars
- [ ] Implement recommendation caching (Redis)

## Metrics

| Metric | Current | Target |
|--------|---------|--------|
| API Response Time | ~50ms (no LLM) | <200ms (with LLM) |
| Car Database Size | 10 models | 100+ models |
| Code Coverage | ~30% | 80%+ |
| LLM Cost/Request | Disabled | <$0.01 with gpt-3.5-turbo |

## Questions? 

Refer to `SPRING_AI_SETUP.md` for API usage and setup instructions.

---


This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.17.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
