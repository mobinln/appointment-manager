# Appointment Manager Module

## Overview

A production-ready reservation/appointment service built with Node.js, TypeScript, MongoDB (Mongoose), and cron jobs for background processing.
It exposes a REST API and is designed to be containerized and horizontally scalable.

## Overall Structure

This module consists of 3 main entities

1. timetable
2. slot
3. event

You can create a `timetable`, which a cron job will get triggered, and then make `slots` based on that timetable
You can then create an `event` for each slot and accept, reject, reschedule, or cancel it.
There is also an `event-history` included inside the `event` schema, which keeps track of the history of the `event`.

## TODO

- [ ] Add more logs
- [ ] Add swagger
- [ ] Add unit tests
- [ ] Document architecture
- [ ] Add API versioning strategy
- [ ] Add health check endpoints for monitoring
- [ ] Implement graceful shutdown handling
- [ ] Add database indexing on frequently queried fields (startTime, endTime, timetableId)
- [ ] Implement pagination for API endpoints that return lists
- [ ] Handle the case when a slot-cron fails
