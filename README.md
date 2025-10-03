# FullStack Home Assignment - Car Dealership
## Introduction
We’d like to assess your ability to design, implement, and deliver a small fullstack application. The assignment is meant to give us insight into how you structure code, handle API logic, manage state, and think about user experience.

## Requirements
This is a small car dealership system.

It should have the following pages:
* Car list - A page to display all cars. From it a user should be able to go to the create car page, car info page, and also the user should be able to delete a car from there.
* Create car - A page to create a new car.
* Car info - A page to show the car info. Should also support editing.

The Car type (located [here](/packages/common/src/models/Car.ts)) is the following:
```typescript
interface Car {
	/** The unique identifier for the car */
	sku: string;
	model: string;
	make: string;
	price: number;
	year: number;
	color: "red" | "blue" | "green" | "yellow" | "silver" | "black" | "white";
}
```
The user should be able create/update a car using ***both the UI or an Excel file***.

Specifications:
* A car SKU is immutable. Once a car was created, the user should not be able to change it.
* Both create and update actions should use the same excel format. For each SKU in the excel, it's data will be replaced with the on in the excel.
* Both create and upadte actions, for both UI and excel, should have data validation to check for valid data shape and values. Invalid data should NOT be inserted to the DB.

Please include the excel files, used to test your system in your repo.

## Duration
We ask you to work on this assignment for a total of up to 4 hours (net duration)
It can be less, but please don't invest more than that.

## Stack
The provided template is using the following stack:
* Backend - Node.js with typescript.
* Database - MongoDB (will run in a docker container).
* Client - React with typescript.

## Setup
>This repository was created and configured for VSCode. It's recommended to use VSCode or any of its forks for easy debugging experience. Using any other IDE would require you to do some setup manually.

After opening the repo in your IDE, run `pnpm install` to install the repo's dependencies (this repo is using the pnpm package manager).
No production build needed for this project.
### Running in VSCode
In the debug tab, select the `Debugging` configuration and start the debug.
### Running in any other IDE
* Run `docker compose up -d`
* In one terminal run `pnpm backend dev`
* In another terminal run `pnpm frontend dev`

## Libraries
### Backend
* Excel parsing: [`xlsx`](https://sheetjs.com) is the recommended library and already comes with the repo.
* MongoDB: [`mongodb`](https://github.com/mongodb/node-mongodb-native) is the native node driver and already comes with the repo.

### Fronend
* Data fetching: [`axios`](https://axios-http.com) is the recommended library and already comes with the repo. Bonus points for using it with [`@tanstack/react-query`](https://tanstack.com/query/latest).
* UI Components: You may use any component library you like. We recommend [`mantine`](https://mantine.dev).
* Form management: You may use any implementation/library you want. We recommend [`react-hook-form`](https://react-hook-form.com).

### Common
* Validation: You may use any validation library you want. We recommend [`zod`](https://zod.dev)
