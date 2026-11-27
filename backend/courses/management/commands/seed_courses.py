from django.core.management.base import BaseCommand

from courses.models import Course


# The catalogue, grouped by the Course.CATEGORY_CHOICES value it belongs to.
# Each row is (title, level, description); level must be one of
# Course.LEVEL_CHOICES. Titles are the natural key used for upserting, so
# renaming one creates a new course rather than updating the existing row.
CATALOGUE = {
    "Frontend": [
        ("HTML Fundamentals", "Beginner", "Learn the fundamentals of HTML and build structured web pages."),
        ("CSS Fundamentals", "Beginner", "Learn styling, layouts, selectors and modern CSS."),
        ("JavaScript Development", "Beginner", "Understand JavaScript programming and browser interactions."),
        ("React JS Development", "Intermediate", "Build interactive user interfaces using React."),
        ("Angular Development", "Intermediate", "Develop modern web applications using Angular."),
        ("Bootstrap and Responsive Design", "Beginner", "Create responsive websites using Bootstrap."),
        ("Semantic HTML and Accessibility", "Intermediate", "Mark up content so assistive technology can navigate it."),
        ("CSS Flexbox Layouts", "Beginner", "Arrange interfaces along one axis with flexible boxes."),
        ("CSS Grid Layouts", "Intermediate", "Build two-dimensional page layouts with CSS Grid."),
        ("CSS Animations and Transitions", "Intermediate", "Add motion to interfaces with transitions and keyframes."),
        ("Sass and CSS Preprocessors", "Intermediate", "Organise large stylesheets with variables, nesting and mixins."),
        ("Tailwind CSS", "Intermediate", "Compose interfaces from utility classes and design tokens."),
        ("Responsive Web Design Patterns", "Intermediate", "Apply layout patterns that adapt from mobile to desktop."),
        ("Web Accessibility and WCAG", "Advanced", "Meet accessibility standards and audit interfaces for barriers."),
        ("TypeScript for Frontend", "Intermediate", "Add static types to frontend code and catch errors earlier."),
        ("Modern JavaScript Features", "Intermediate", "Work with modules, destructuring, generators and newer syntax."),
        ("Asynchronous JavaScript", "Intermediate", "Handle promises, async/await and concurrent browser work."),
        ("DOM Manipulation Techniques", "Beginner", "Read and change page structure directly from JavaScript."),
        ("Browser APIs and Storage", "Intermediate", "Use storage, fetch, workers and other browser capabilities."),
        ("React Hooks in Depth", "Intermediate", "Manage state and effects with the React hooks API."),
        ("React State Management", "Advanced", "Structure shared state across a large React application."),
        ("Redux Toolkit", "Advanced", "Model predictable application state with reducers and slices."),
        ("React Router and Navigation", "Intermediate", "Build client-side routing, nested routes and guards."),
        ("React Performance Optimisation", "Advanced", "Profile renders and remove avoidable work from the UI."),
        ("Next.js Fundamentals", "Intermediate", "Build routed, production-ready React apps with Next.js."),
        ("Server-Side Rendering with Next.js", "Advanced", "Render on the server and stream content to the browser."),
        ("Vue.js Development", "Intermediate", "Build reactive interfaces with the Vue framework."),
        ("Vue Composition API", "Advanced", "Structure Vue components with composable reactive logic."),
        ("Svelte and SvelteKit", "Intermediate", "Build compiled, reactive interfaces with Svelte."),
        ("Angular Forms and Validation", "Intermediate", "Build reactive forms with validation and error handling."),
        ("Angular RxJS and Observables", "Advanced", "Model asynchronous streams with observables and operators."),
        ("Component Development with Storybook", "Intermediate", "Develop and document components in isolation."),
        ("Frontend Testing with Jest", "Intermediate", "Unit test components and application logic."),
        ("End-to-End Testing with Playwright", "Advanced", "Drive a real browser to test complete user journeys."),
        ("Vite and Modern Build Tooling", "Intermediate", "Configure fast development servers and production builds."),
        ("Webpack Configuration", "Advanced", "Bundle, split and optimise assets with Webpack."),
        ("Progressive Web Applications", "Advanced", "Add offline support, caching and installability."),
        ("Web Performance and Core Web Vitals", "Advanced", "Measure and improve loading, interactivity and layout stability."),
        ("Frontend Security Essentials", "Advanced", "Defend against XSS, CSRF and unsafe content injection."),
        ("Micro Frontends", "Advanced", "Compose one product from independently deployed frontends."),
        ("Design Systems and Component Libraries", "Advanced", "Build a shared component library and design tokens."),
        ("Data Visualisation with D3", "Advanced", "Bind data to scalable graphics and build custom charts."),
    ],
    "Backend": [
        ("Python Full Stack Development", "Beginner", "Learn Python and build full-stack web applications."),
        ("Django Development", "Intermediate", "Build web applications using the Django framework."),
        ("Node.js Development", "Intermediate", "Learn server-side JavaScript development."),
        ("Express.js Development", "Intermediate", "Create backend applications and APIs using Express."),
        ("Java Spring Boot", "Advanced", "Develop enterprise applications using Spring Boot."),
        ("REST API Development", "Advanced", "Design and develop RESTful backend services."),
        ("Django REST Framework", "Intermediate", "Build serialised, browsable APIs on top of Django."),
        ("Django ORM and Query Optimisation", "Advanced", "Write efficient queries and avoid N+1 access patterns."),
        ("Flask Development", "Beginner", "Build small web services with the Flask microframework."),
        ("FastAPI Development", "Intermediate", "Build typed, asynchronous APIs with automatic documentation."),
        ("Asynchronous Python with asyncio", "Advanced", "Run concurrent I/O-bound work with coroutines and tasks."),
        ("Authentication and Authorisation", "Intermediate", "Verify identity and enforce permissions in web services."),
        ("Token Based Authentication with JWT", "Intermediate", "Issue, verify and refresh signed access tokens."),
        ("OAuth 2.0 and OpenID Connect", "Advanced", "Delegate authentication and authorise third-party access."),
        ("GraphQL API Development", "Advanced", "Expose a typed schema and resolve client-shaped queries."),
        ("gRPC and Protocol Buffers", "Advanced", "Define service contracts and stream binary messages."),
        ("API Design and Versioning", "Advanced", "Design stable interfaces and evolve them without breaking clients."),
        ("Rate Limiting and API Throttling", "Intermediate", "Protect services from abuse and uneven traffic."),
        ("Caching with Redis", "Intermediate", "Cache expensive work and invalidate it correctly."),
        ("Message Queues with RabbitMQ", "Advanced", "Decouple services with durable queues and routing."),
        ("Event Streaming with Apache Kafka", "Advanced", "Publish and consume ordered event streams at scale."),
        ("Background Jobs with Celery", "Intermediate", "Move slow work out of the request cycle."),
        ("Microservices Architecture", "Advanced", "Split a system into independently deployable services."),
        ("Domain Driven Design", "Advanced", "Model complex business rules around a shared domain language."),
        ("Clean Architecture for Backends", "Advanced", "Separate business rules from frameworks and transports."),
        ("Spring Data JPA", "Intermediate", "Map Java objects to relational tables and query them."),
        ("Spring Security", "Advanced", "Secure Java services with filters, roles and method guards."),
        ("Java Microservices with Spring Cloud", "Advanced", "Add discovery, configuration and resilience to Java services."),
        ("ASP.NET Core Development", "Intermediate", "Build cross-platform web services with .NET."),
        ("Go Web Services", "Intermediate", "Write fast, concurrent HTTP services in Go."),
        ("Ruby on Rails Development", "Intermediate", "Build conventional, database-backed web applications."),
        ("PHP and Laravel Development", "Intermediate", "Build modern PHP applications with Laravel."),
        ("Serverless Functions", "Intermediate", "Deploy event-driven functions without managing servers."),
        ("Docker for Developers", "Intermediate", "Package applications into reproducible container images."),
        ("Kubernetes Fundamentals", "Advanced", "Deploy, scale and operate containers on a cluster."),
        ("CI and CD Pipelines", "Intermediate", "Automate builds, tests and releases on every change."),
        ("Infrastructure as Code with Terraform", "Advanced", "Describe and version cloud infrastructure declaratively."),
        ("Observability and Structured Logging", "Advanced", "Instrument services with logs, metrics and traces."),
        ("Backend Testing Strategies", "Intermediate", "Combine unit, integration and contract tests effectively."),
        ("WebSockets and Real Time Services", "Advanced", "Push live updates over persistent connections."),
        ("File Uploads and Media Handling", "Intermediate", "Accept, validate and store user-supplied files safely."),
        ("Backend Security and the OWASP Top 10", "Advanced", "Find and fix the most common server-side vulnerabilities."),
    ],
    "Database": [
        ("SQL Fundamentals", "Beginner", "Learn SQL queries and relational database concepts."),
        ("MySQL Database", "Beginner", "Manage relational databases using MySQL."),
        ("PostgreSQL Database", "Intermediate", "Work with PostgreSQL databases and queries."),
        ("MongoDB Database", "Intermediate", "Learn NoSQL database concepts using MongoDB."),
        ("Advanced SQL", "Advanced", "Explore joins, subqueries, CTEs and window functions."),
        ("Database Design", "Advanced", "Learn database modelling and normalization."),
        ("Relational Data Modelling", "Intermediate", "Translate business entities into tables and relationships."),
        ("Normalisation and Schema Design", "Intermediate", "Remove redundancy and design dependable schemas."),
        ("SQL Joins in Depth", "Beginner", "Combine tables with inner, outer and self joins."),
        ("Window Functions in SQL", "Advanced", "Rank, aggregate and compare rows within partitions."),
        ("Common Table Expressions", "Intermediate", "Structure readable queries and express recursion."),
        ("Stored Procedures and Functions", "Intermediate", "Move repeated logic into the database."),
        ("Database Indexing Strategies", "Advanced", "Choose indexes that match real query patterns."),
        ("Query Performance Tuning", "Advanced", "Read execution plans and remove slow operations."),
        ("Transactions and Isolation Levels", "Advanced", "Reason about atomicity, consistency and concurrent reads."),
        ("Database Concurrency Control", "Advanced", "Handle locking, deadlocks and contention."),
        ("PostgreSQL Administration", "Advanced", "Configure, monitor and maintain a PostgreSQL server."),
        ("PostgreSQL JSON and JSONB", "Intermediate", "Store and query semi-structured documents in Postgres."),
        ("MySQL Performance Tuning", "Advanced", "Tune storage engines, buffers and slow queries."),
        ("SQLite for Applications", "Beginner", "Embed a zero-configuration database in an application."),
        ("Microsoft SQL Server Essentials", "Intermediate", "Query and administer SQL Server databases."),
        ("Oracle Database Fundamentals", "Intermediate", "Work with Oracle schemas, PL/SQL and tooling."),
        ("NoSQL Data Modelling", "Intermediate", "Design documents and keys around access patterns."),
        ("MongoDB Aggregation Framework", "Advanced", "Transform and summarise documents through pipelines."),
        ("Redis Data Structures", "Intermediate", "Use strings, hashes, sets and sorted sets effectively."),
        ("Cassandra and Wide Column Stores", "Advanced", "Model partitioned data for write-heavy workloads."),
        ("Elasticsearch and Search Indexing", "Advanced", "Index documents and build relevant full-text search."),
        ("Graph Databases with Neo4j", "Advanced", "Model connected data and traverse it with Cypher."),
        ("Time Series Databases", "Advanced", "Store and downsample high-volume measurement data."),
        ("Vector Databases for AI", "Advanced", "Index embeddings and run similarity search."),
        ("Data Warehousing Concepts", "Intermediate", "Design fact and dimension tables for analytics."),
        ("ETL and Data Pipelines", "Intermediate", "Extract, transform and load data between systems."),
        ("Database Migrations and Versioning", "Intermediate", "Evolve schemas safely alongside application code."),
        ("Backup and Disaster Recovery", "Advanced", "Plan, test and restore from dependable backups."),
        ("Database Security and Access Control", "Advanced", "Grant least-privilege access and protect data at rest."),
        ("Database Scaling and Sharding", "Advanced", "Replicate and partition data as load grows."),
    ],
    "AI/ML": [
        ("Artificial Intelligence Fundamentals", "Beginner", "Understand the foundations of artificial intelligence."),
        ("Data Science with Python", "Beginner", "Explore data analysis and visualization using Python."),
        ("Machine Learning", "Intermediate", "Learn machine learning algorithms and model training."),
        ("Deep Learning", "Advanced", "Explore neural networks and deep learning architectures."),
        ("Natural Language Processing", "Advanced", "Work with text processing and language models."),
        ("Computer Vision", "Advanced", "Understand image processing and computer vision."),
        ("Generative AI", "Intermediate", "Explore generative AI models and applications."),
        ("Prompt Engineering", "Intermediate", "Learn techniques for writing effective AI prompts."),
        ("Python for Data Analysis", "Beginner", "Load, filter and summarise datasets in Python."),
        ("NumPy and Pandas", "Beginner", "Work with arrays and dataframes for analytical work."),
        ("Data Cleaning and Preparation", "Beginner", "Handle missing values, outliers and inconsistent records."),
        ("Data Visualisation with Matplotlib", "Beginner", "Plot distributions, trends and comparisons."),
        ("Exploratory Data Analysis", "Intermediate", "Profile a dataset and form hypotheses before modelling."),
        ("Statistics for Machine Learning", "Intermediate", "Apply distributions, sampling and hypothesis testing."),
        ("Linear Algebra for Machine Learning", "Intermediate", "Work with vectors, matrices and decompositions."),
        ("Probability and Bayesian Thinking", "Advanced", "Reason about uncertainty and update beliefs from evidence."),
        ("Supervised Learning Algorithms", "Intermediate", "Train and compare classifiers and regressors."),
        ("Unsupervised Learning and Clustering", "Intermediate", "Group unlabelled data and reduce dimensionality."),
        ("Feature Engineering", "Intermediate", "Derive, encode and select informative model inputs."),
        ("Model Evaluation and Validation", "Intermediate", "Measure performance honestly with the right metrics."),
        ("Regression Analysis", "Intermediate", "Model continuous outcomes and interpret coefficients."),
        ("Decision Trees and Random Forests", "Intermediate", "Build interpretable and ensembled tree models."),
        ("Gradient Boosting and XGBoost", "Advanced", "Train high-performing boosted tree ensembles."),
        ("Support Vector Machines", "Advanced", "Separate classes with margins and kernel methods."),
        ("Neural Networks from Scratch", "Advanced", "Implement forward and backward passes by hand."),
        ("TensorFlow Development", "Advanced", "Build and train models with TensorFlow and Keras."),
        ("PyTorch Development", "Advanced", "Build and train models with PyTorch."),
        ("Convolutional Neural Networks", "Advanced", "Apply convolutional architectures to image tasks."),
        ("Recurrent Networks and Sequence Models", "Advanced", "Model ordered data with recurrent architectures."),
        ("Transformers and Attention", "Advanced", "Understand attention and the transformer architecture."),
        ("Large Language Model Fundamentals", "Intermediate", "Understand how language models are trained and served."),
        ("Retrieval Augmented Generation", "Advanced", "Ground model answers in retrieved source documents."),
        ("Fine Tuning Language Models", "Advanced", "Adapt pretrained models to a specific task or domain."),
        ("AI Agents and Tool Use", "Advanced", "Let models plan, call tools and act on results."),
        ("MLOps and Model Deployment", "Advanced", "Package, serve and version models in production."),
        ("Model Monitoring and Drift", "Advanced", "Detect degraded performance and shifting inputs."),
        ("Recommender Systems", "Advanced", "Rank items with collaborative and content-based methods."),
        ("Time Series Forecasting", "Advanced", "Model seasonality and trend to predict future values."),
        ("Reinforcement Learning", "Advanced", "Train agents to act through rewards and exploration."),
        ("Responsible AI and Model Ethics", "Intermediate", "Assess fairness, transparency and model impact."),
    ],
    "Programming": [
        ("C Programming", "Beginner", "Learn programming fundamentals using C."),
        ("C++ Programming", "Intermediate", "Understand object-oriented programming using C++."),
        ("Data Structures and Algorithms", "Advanced", "Learn essential data structures and algorithms."),
        ("Java Programming", "Advanced", "Learn Java programming and object-oriented concepts."),
        ("Python Programming", "Beginner", "Learn Python syntax, data types and control flow."),
        ("JavaScript Programming Foundations", "Beginner", "Learn the core JavaScript language, independent of the browser."),
        ("Go Programming", "Intermediate", "Write simple, concurrent programs in Go."),
        ("Rust Programming", "Advanced", "Write memory-safe systems code with ownership and borrowing."),
        ("Kotlin Programming", "Intermediate", "Write concise JVM applications with Kotlin."),
        ("Swift Programming", "Intermediate", "Build applications for Apple platforms with Swift."),
        ("C# Programming", "Intermediate", "Write applications on the .NET platform with C#."),
        ("TypeScript Programming", "Intermediate", "Add a static type system to JavaScript codebases."),
        ("Ruby Programming", "Intermediate", "Write expressive, object-oriented Ruby."),
        ("PHP Programming", "Beginner", "Learn server-side scripting with PHP."),
        ("Scala Programming", "Advanced", "Combine object-oriented and functional styles on the JVM."),
        ("Shell Scripting with Bash", "Beginner", "Automate routine tasks from the command line."),
        ("Object Oriented Programming Principles", "Intermediate", "Apply encapsulation, inheritance and polymorphism."),
        ("Functional Programming Concepts", "Advanced", "Work with pure functions, immutability and composition."),
        ("Design Patterns", "Advanced", "Recognise and apply proven solutions to recurring problems."),
        ("SOLID Principles", "Intermediate", "Design classes that stay changeable as systems grow."),
        ("Clean Code Practices", "Intermediate", "Write code that communicates its intent clearly."),
        ("Refactoring Techniques", "Intermediate", "Improve existing code without changing its behaviour."),
        ("Unit Testing Fundamentals", "Beginner", "Write focused tests that document behaviour."),
        ("Test Driven Development", "Intermediate", "Drive design by writing the failing test first."),
        ("Debugging and Profiling", "Intermediate", "Locate defects and performance problems systematically."),
        ("Version Control with Git", "Beginner", "Track changes, branch and recover previous work."),
        ("Collaborative Git Workflows", "Intermediate", "Review, merge and release changes as a team."),
        ("Sorting and Searching Algorithms", "Intermediate", "Implement and compare classic algorithms."),
        ("Graph Algorithms", "Advanced", "Traverse graphs and solve shortest-path problems."),
        ("Dynamic Programming", "Advanced", "Solve overlapping subproblems with memoisation and tables."),
        ("Recursion and Backtracking", "Intermediate", "Express solutions recursively and prune search spaces."),
        ("Algorithmic Complexity Analysis", "Intermediate", "Reason about time and space cost with big-O notation."),
        ("Competitive Programming", "Advanced", "Solve timed algorithmic problems under constraints."),
        ("Concurrency and Multithreading", "Advanced", "Coordinate threads, locks and shared state safely."),
        ("Memory Management", "Advanced", "Understand allocation, garbage collection and leaks."),
        ("Compilers and Interpreters", "Advanced", "Understand how source code becomes running programs."),
        ("Operating System Concepts", "Intermediate", "Learn processes, scheduling, memory and file systems."),
        ("Computer Networks", "Intermediate", "Understand the protocol layers behind networked software."),
        ("System Design Fundamentals", "Advanced", "Design scalable systems and justify the trade-offs."),
        ("Technical Interview Preparation", "Intermediate", "Practise problem solving and explain your reasoning."),
    ],
}

# Indicative study time, derived from level so it stays consistent as the
# catalogue grows. The UI renders this next to each course.
DURATION_BY_LEVEL = {
    "Beginner": "2 weeks",
    "Intermediate": "4 weeks",
    "Advanced": "6 weeks",
}


def build_course_data():
    return [
        {
            "title": title,
            "category": category,
            "level": level,
            "duration": DURATION_BY_LEVEL[level],
            "description": description,
        }
        for category, rows in CATALOGUE.items()
        for (title, level, description) in rows
    ]


COURSE_DATA = build_course_data()


class Command(BaseCommand):
    help = "Import the TalentPath IQ course catalogue into the database"

    def handle(self, *args, **options):
        # Guard against a typo silently creating a course the API filters
        # cannot return, since category and level are validated choices.
        valid_categories = {value for value, _ in Course.CATEGORY_CHOICES}
        valid_levels = {value for value, _ in Course.LEVEL_CHOICES}

        bad = [
            course["title"]
            for course in COURSE_DATA
            if course["category"] not in valid_categories
            or course["level"] not in valid_levels
        ]
        if bad:
            self.stderr.write(
                self.style.ERROR(
                    f"{len(bad)} course(s) use a category or level outside the "
                    f"model choices, starting with: {bad[0]}"
                )
            )
            return

        titles = [course["title"] for course in COURSE_DATA]
        duplicates = {t for t in titles if titles.count(t) > 1}
        if duplicates:
            # Title is the upsert key, so duplicates would silently collapse
            # into a single row and the total would come up short.
            self.stderr.write(
                self.style.ERROR(f"Duplicate titles in the catalogue: {sorted(duplicates)}")
            )
            return

        created_count = 0
        updated_count = 0

        for course_data in COURSE_DATA:
            _, created = Course.objects.update_or_create(
                title=course_data["title"],
                defaults={
                    "category": course_data["category"],
                    "level": course_data["level"],
                    "description": course_data["description"],
                    "duration": course_data["duration"],
                },
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Course import completed! "
                f"Created: {created_count}, "
                f"Updated: {updated_count}, "
                f"Total in database: {Course.objects.count()}"
            )
        )
