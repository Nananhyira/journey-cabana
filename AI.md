# AI-Assisted Workflow

## Overview

AI was used as a collaborative development tool throughout this project. I used
Claude (Sonnet) as a pair-programming, reasoning, debugging, and code-review
assistant.

I remained responsible for understanding the requirements, making architectural
decisions, reviewing generated code, running the application and tests, and
deciding which suggestions to accept or reject.

The workflow was iterative: I provided requirements or implementation context,
reviewed the proposed solution, tested the result, identified issues or
improvements, and used those findings to guide subsequent iterations.

---

## Tool Used

**Claude (Sonnet)**

Claude was used in an ongoing development conversation with code-execution
capabilities. This allowed it to inspect, create, edit, and reason about
project files in addition to providing implementation suggestions.

---

## Areas Where AI Assisted

AI assistance was used for:

- Requirements analysis and decomposition.
- Frontend/backend architecture discussions.
- REST API design.
- ASCII map parsing.
- React component implementation.
- Booking-flow implementation.
- Automated test planning and implementation.
- Debugging.
- Code and architecture review.
- Accessibility and responsive UI considerations.
- README and technical documentation review.

AI suggestions were reviewed against the assignment requirements before being
accepted into the implementation.

---

## Development Workflow

### 1. Requirements and planning

I first provided the assignment requirements and recruitment instructions to
Claude and used the conversation to break the problem into smaller technical
areas.

The main questions discussed were:

- How should the ASCII map be represented?
- What should constitute an individual cabana?
- What does `bookings.json` represent?
- What is the smallest REST API that satisfies the requirements?
- How should the single-entrypoint requirement work?
- Which supplied assets and features were required versus optional?

Two ambiguous requirements were explicitly resolved and documented in the
README:

1. Each `W` tile is treated as an individual bookable cabana.
2. `bookings.json` is treated as a guest registry because it contains room and
   guest information but does not associate guests with particular cabanas.

### 2. Backend

AI assisted with the design and implementation of the map parser and REST API.

The backend was deliberately kept small:

- `GET /api/map`
- `POST /api/book`

The map parser converts the ASCII source into a structured grid and a list of
cabanas. Each cabana receives an ID based on its map coordinates.

The booking endpoint validates:

1. Required fields.
2. Cabana existence.
3. Cabana availability.
4. Room number + guest name against the guest registry.

Successful bookings are stored in memory as required by the assignment.

### 3. Frontend

AI assisted with the React implementation, including:

- Resort map rendering.
- Cabana selection.
- Booking modal.
- API integration.
- Booking confirmation.
- Immediate map state updates.
- Error handling.
- Keyboard interaction.
- Responsive tile sizing.

The frontend does not read the source map or booking files directly. It uses
the REST API as its source of truth.

### 4. Verification

I did not treat generated code as complete simply because it compiled or
appeared reasonable during review.

I ran the application and automated tests locally and manually exercised the
main booking flow.

Verification included:

- Rendering the resort map.
- Selecting an available cabana.
- Submitting an invalid guest.
- Submitting a valid guest.
- Confirming a successful booking.
- Confirming the booked cabana is visually updated.
- Attempting to interact with an already-booked cabana.
- Testing the application at a smaller viewport.

---

## AI-Assisted Decisions and Iteration

### Cabana representation

The map contains contiguous `W` tiles around the pool. We considered whether
these should be interpreted as one larger cabana area or multiple cabanas.

The final implementation treats each `W` cell as an individual cabana. This
was chosen because the task defines `W` as a cabana but does not provide a
separate grouping identifier. It also keeps the booking model simple and
avoids introducing unnecessary cluster-detection logic.

### Guest validation

The supplied booking data contains room numbers and guest names but does not
associate guests with specific cabanas.

The implementation therefore treats the file as a guest registry. A guest is
validated when the submitted room number and guest name match an entry, after
which the selected cabana can be booked.

### API scope

The API was intentionally limited to two endpoints. A separate cabana lookup
endpoint, authentication middleware, database, or persistence layer was not
introduced because none is required by the assignment.

### Responsive map

During development, the map was tested at a smaller viewport rather than
assuming that a desktop layout was sufficient.

The initial responsive approach used a fixed breakpoint. Testing showed that
this did not reliably fit the map. The implementation was changed to calculate
tile size from the available container width and the map's actual column
count.

This produces a more general solution without introducing multiple
device-specific breakpoints.

### Path-direction assets

The supplied directional arrow assets were investigated rather than simply
assuming they were unused.

Using them would require analyzing neighboring `#` tiles to determine
straight paths, corners, dead ends, and crossings, as well as selecting and
rotating the appropriate asset.

This was considered useful visual polish but outside the core booking
requirements, so the feature was intentionally left out to keep the solution
right-sized for the assignment.

---

## Bugs and Corrections

AI-assisted development also produced issues that were discovered through
actual verification.

### Module/data naming collision

During development, a TypeScript module and JSON data file initially shared
the same basename in the same directory. This caused module resolution to
select the JSON file unexpectedly at runtime.

The immediate issue was fixed by renaming the module. The final project also
separates application code under `server/src/` from input data under
`server/data/`, preventing this class of naming collision.

### Frontend build path

The path used to serve the built frontend required correction once the client
and server workspaces were running together.

This was identified during local verification and corrected before completion.

### Responsive map sizing

The first responsive implementation did not reliably fit the map at a small
viewport. Testing exposed the issue and led to the current container-width
based tile sizing approach.

---

## Example Prompts

The prompts evolved throughout the implementation. Examples included:

### Architecture

> Analyze this coding test and propose the simplest full-stack architecture
> that satisfies the requirements without unnecessary abstractions.

### Map parsing

> Given this ASCII resort map and its tile definitions, design a clean parser
> that exposes the grid and cabana information to a React frontend.

### API design

> Design the minimum REST API required for the resort map and cabana booking
> flow.

### Testing

> Review these requirements and identify the important backend and frontend
> behaviors that should be covered by automated tests.

### Code review

> Review this implementation against the original assignment. Identify
> unnecessary complexity, missing edge cases, and deviations from the
> requirements.

### Debugging

> Analyze this runtime error, identify its root cause, and suggest the smallest
> appropriate fix.

---

## Human Responsibilities

I retained responsibility for:

- Understanding and interpreting the requirements.
- Resolving ambiguous requirements.
- Choosing the overall architecture.
- Reviewing AI-generated code and suggestions.
- Running the application and tests.
- Performing manual verification.
- Identifying whether proposed solutions were unnecessarily complex.
- Making the final implementation decisions.
- Reviewing the final documentation.

AI was used to accelerate implementation and provide an additional engineering
perspective, but generated code was treated as a starting point rather than
automatically accepted output.

---

## Summary

The development process followed an iterative collaboration model:

Requirements
→ AI-assisted analysis
→ Proposed implementation
→ Human review
→ Implementation
→ Local testing
→ Issue identification
→ AI-assisted debugging/review
→ Human verification
→ Final implementation

The objective was to use AI effectively while maintaining a clear understanding
of the codebase and being able to explain the reasoning behind the final
technical decisions.