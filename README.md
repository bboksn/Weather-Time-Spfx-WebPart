# Weather Time Web Part

A simple SharePoint Framework web part that displays current weather using Azure Maps, with a location search input, live clock, and a compact temperature display.

## Key features

- Current weather lookup via Azure Maps REST APIs
- Search by city, address, or U.S. ZIP code
- Live browser time display
- Clickable temperature unit toggle (`°C` / `°F`)
- Minimal, one-line search interface

## Prerequisites

- Node.js 22.x (`>=22.14.0 < 23.0.0`)
- An Azure Maps subscription key
- A SharePoint Online tenant to deploy the web part

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd weather-time-webpart
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Trust the SPFx developer certificate if needed:
   ```bash
   npx @microsoft/sp-build-web --trust-dev-cert
   ```

## Run locally

Start the local development experience:

```bash
npm start
```

## Build for production

```bash
npm run build
```

## Deploy to production

1. Package the solution if not already built:
   ```bash
   npm run build
   ```
2. Open the generated package in `sharepoint/solution` or `sharepoint/solution/<solution-name>.sppkg`.
3. Upload the `.sppkg` file to your SharePoint App Catalog.
4. In the App Catalog, choose to deploy the package and trust any requested permissions.
5. Add the web part to a SharePoint page in the target site collection.
6. Enter your Azure Maps key in the web part property pane and save the page.

> If your App Catalog uses tenant-scoped deployment, the web part will become available across the tenant.

## Azure Maps key configuration

1. Add the web part to a SharePoint page.
2. Open the web part property pane.
3. Enter your Azure Maps subscription key in the Azure Maps key field.
4. Save the web part properties.

> The key is required to call Azure Maps address search and weather APIs.

## How to use the web part

- Type a city name, address, or U.S. ZIP code into the search field.
- Press `Enter` to run the lookup.
- Click the temperature unit label to switch between Celsius and Fahrenheit.
- The current location and live clock are shown inside the card.

## Project structure

- `src/webparts/weatherTime/components/Weather.tsx` — main React weather UI and Azure Maps logic
- `src/webparts/weatherTime/WeatherTime.tsx` — React wrapper for the web part
- `src/webparts/weatherTime/WeatherTimeWebPart.ts` — SPFx web part declaration and property pane

## Notes

- This project uses SharePoint Framework `1.22.2`.
- The component is designed for a lightweight, minimal visual impression.
- If ZIP code lookup fails, verify that the Azure Maps key is valid and that the API is reachable.

## References

- [SharePoint Framework documentation](https://learn.microsoft.com/sharepoint/dev/spfx/)
- [Azure Maps REST APIs](https://learn.microsoft.com/azure/azure-maps/)
- [Heft documentation](https://heft.rushstack.io/)
