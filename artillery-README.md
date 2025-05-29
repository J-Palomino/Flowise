# Artillery Load Testing Guide

This document explains how to use the load testing suite defined in `artillery-load-test.yml` for this project.

## Prerequisites
- [Node.js](https://nodejs.org/) installed (v12 or later recommended)
- [Artillery](https://artillery.io/) installed globally

Install Artillery with:
```sh
npm install -g artillery
```

## Running the Load Test
1. Open a terminal and navigate to the project directory:
   ```sh
   cd /Users/juan/Code/Flowise
   ```
2. Run the test:
   ```sh
   artillery run artillery-load-test.yml
   ```
   This will execute the load test as described in the YAML file and display results in your terminal.

## Saving and Viewing Reports
- To save the results to a JSON file:
  ```sh
  artillery run artillery-load-test.yml -o report.json
  ```
- To generate an HTML report from the JSON output:
  ```sh
  artillery report --output report.html report.json
  ```
  Open `report.html` in your browser to view the detailed report.

## Customizing the Test
- Edit `artillery-load-test.yml` to change scenarios, target endpoints, load phases, or payloads.
- See [Artillery Documentation](https://www.artillery.io/docs/) for advanced configuration options.

## Troubleshooting
- If you see `command not found: artillery`, ensure you installed Artillery globally and your npm global bin is in your PATH.
- For more help, run:
  ```sh
  artillery --help
  ```

---

For questions about the test scenarios or customizing the load test, see the comments in `artillery-load-test.yml` or refer to the official Artillery docs.
