# Welcome to Assignment Mobile - Hello Mobile

<p align="left">
  <a href="https://github.com/L02-hello-mobile/assignment-mobile/actions/workflows/test.yml">
    <img src="https://github.com/L02-hello-mobile/assignment-mobile/actions/workflows/test.yml/badge.svg" alt="CI Status">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=L02-hello-mobile_assignment-mobile">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=L02-hello-mobile_assignment-mobile&metric=alert_status" alt="Quality Gate Status">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=L02-hello-mobile_assignment-mobile">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=L02-hello-mobile_assignment-mobile&metric=coverage" alt="Coverage">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=L02-hello-mobile_assignment-mobile">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=L02-hello-mobile_assignment-mobile&metric=bugs" alt="Bugs">
  </a>
  <a href="https://sonarcloud.io/summary/new_code?id=L02-hello-mobile_assignment-mobile">
    <img src="https://sonarcloud.io/api/project_badges/measure?project=L02-hello-mobile_assignment-mobile&metric=vulnerabilities" alt="Vulnerabilities">
  </a>
</p>

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you will find options to open the app in a

- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
- Web browser via `npm run web`

## Testing

This project uses **Jest** and **React Native Testing Library** for testing.

### Run tests locally

- **Run all tests:**

  ```bash
  npm test
  ```

- **Run tests with coverage report:**

  ```bash
  npm run test:coverage
  ```

  After running, view the detailed HTML report at:
  `coverage/lcov-report/index.html`

- **Watch mode:**
  ```bash
  npx jest --watch
  ```
