I'm creating a new project - airline manager game.

The game should operate on a globe, where major cities are located. The cities could be connected with a routes, with airplanes flying this routes, carrying passengers. Using airport costs money, but moving passengers earns money. Also user needs to buy aircraft and pay to access new airports. Fleet of aircrafts is limited and they come in different models with varying speed, range and passenger capacity.

The project should be implemented as a web application, using typescript and three.js. Eslint and prettier should be used for linting and formatting code.

Documentation for the project should be contained in `docs` directory, in markdown format. Documentation must be updated when necessary.

Implementation plan should be contained in `docs/plan.md` and must be updated when new plan emerges.

### MVP

For an mvp i consider this set of features

- a part of the globe should be displayed on a screen, containing nordic countries.
- map should zoom in and out when scrolled
- no panning needed for mvp, but it will be implemented later
- 10 biggest nordic cities must be displayed - as a circles of 2 sizes (small and big, with only Kopenhagen and Oslo being od big size)
- a user should be able to drag lines from one city to another, representing routes. Routes are directionless and cannot duplicate. Routes are displayed as lines on a suface of the globe.
- cities that contain unused aircraft should have aircraft icon next to the name
- currently there's only 1 type of aircraft, there will be more later
- after a route was created from a city with an unused airplane, it should start flying along the route. Flying should be performed at a fixed speed, regardless of the route length.
- after langing an aircraft should return to point of origin, then cycle repeats.
- a money counter should be displayed in top right corner, increasing by $100 each time an aircraft lands.
