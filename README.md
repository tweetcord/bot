# About
A Twitter bot that allows you to interact with Twitter without leaving Discord.

# Setup

## First time setup
1. Install node.js v16.6+
2. Install deps in package.json (using `yarn`)

## Regular
For updating database schema (prisma):
1. `yarn run db`

You need [Prisma CLI](https://npmjs.com/package/prisma) for this.

For development:
1. `yarn run dev`

You need [ts-devscript](https://npmjs.com/package/ts-devscript) to run this command.

For production:
1. `yarn run start`