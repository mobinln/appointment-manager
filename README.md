# Appointment Manager Module

## Overview

A production-ready reservation/appointment management service built with Node.js, TypeScript, MongoDB (Mongoose), and cron jobs for background processing.
It exposes a REST API and is designed to be containerized and horizontally scalable.

## Entities

- Timetable: We generate slots based on timetables
- Slot: We create event with a slot
- Event & Event-History: Events are the actual reservation units with their history

## Services

- CRUD timetable
- CRUD slot
- Create/Cancel/Reject/Re-Schedule/Complete event

## Architecture

HTTP -> Controller -> Service -> Domain and Repository -> Persistence

## TODO

- [ ] Finalize tests/domain
- [ ] Add timetable persistence and repository
- [ ] Add timetable repository tests
- [ ] Add event persistence and repository
- [ ] Add event repository tests
- [ ] Add slot service (with version for race conditions)
- [ ] Add slot service tests
- [ ] Add timetable service
- [ ] Add timetable service tests
- [ ] Add event service
- [ ] Add event service tests
