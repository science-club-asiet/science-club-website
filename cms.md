# Science Club CMS v2
## Product Vision

This is **not a CMS**.

This is an **Organization Operating System** built specifically for running a university club.

The goal is **not** to manage database records.

The goal is to make every recurring organizational workflow effortless.

Think:

- Linear × Notion × Framer × Figma
- NOT WordPress
- NOT Strapi
- NOT Directus
- NOT another CRUD dashboard

---

# Design Principles

## 1. Workspaces, not Pages

Users should feel like they're entering a workspace.

Not editing a table.

Examples:

- Event Workspace
- Post Workspace
- Registration Workspace
- Executive Committee Workspace

instead of

- Event Table
- Post Table
- Member Table

---

## 2. One Builder

Every editable content type should use the exact same editing philosophy.

Events

↓

Posts

↓

Pages

↓

Forms

↓

Landing Pages

↓

Announcements

All use the same builder.

---

## 3. Blocks, not Forms

Instead of

Title

Description

Image

Button

Think

Hero

Countdown

Gallery

Timeline

FAQ

Registration Form

Speaker Card

Sponsor Grid

Map

CTA

Everything becomes draggable blocks.

---

## 4. Workflows over Database Records

Never ask

"What database row do you want to edit?"

Instead ask

"What are you trying to do?"

Examples

Create Workshop

Publish News

New Executive Committee

New Member Intake

Create Registration Form

Everything begins with workflows.

---

# Layout

```

┌──────────────────────────────────────────────────────────────┐
│ Science Club ▼      2026-27 ▼      Search / ⌘K     🔔   👤   │
├──────────────┬───────────────────────────────────────────────┤
│ Sidebar      │ Workspace                                     │
│              │                                               │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘

```

---

# Global Top Bar

Always Visible

- Science Club Workspace Switcher
- Session Switcher (2026-27, 2027-28...)
- Global Search
- Command Palette (⌘K)
- Notifications
- User Profile

---

# Sidebar

```

🏠 Home

────────────────────────

✨ Create

────────────────────────

📅 Events

📰 Posts

📋 Forms

👥 Members

────────────────────────

🏛 Executive Committee

📥 Applications

🖼 Media Library

────────────────────────

🌐 Website

────────────────────────

⚙ Settings

```

Nothing more.

No clutter.

Everything else belongs inside one of these modules.

---

# Home

Purpose

"What needs my attention today?"

Sections

```

Continue Working

Today's Tasks

Pending Reviews

Upcoming Deadlines

Upcoming Events

Recent Activity

Quick Create

System Health

Notifications

```

NO analytics at the top.

Tasks first.

---

# Create

Universal creation menu.

Never navigate through multiple pages.

```

+ Event

+ News Post

+ Article

+ Research Paper

+ Form

+ Executive Committee

+ Member

+ Page

+ Announcement

+ Media Folder

```

---

# Events

Purpose

Manage complete event lifecycle.

Sections

```

Overview

All Events

Drafts

Templates

Registration

Automation

Analytics

Archive

```

---

## Event Flow

```

Choose Template

↓

Build Event

↓

Attach/Create Registration Form

↓

Automation

↓

Review

↓

Publish

↓

Manage Registrations

```

---

## Event Builder

```

Blocks

Canvas

Inspector

```

Everything is block based.

Blocks include

- Hero
- Countdown
- About
- Schedule
- Speaker
- Sponsor
- FAQ
- Gallery
- Registration Form
- Venue
- Timeline
- Contact
- CTA

---

# Posts

Purpose

Editorial system.

NOT events.

Post Types

```

News

Article

Research Paper

Announcement

Newsletter

```

Flow

```

Choose Post Type

↓

Visual Builder

↓

SEO

↓

Preview

↓

Publish

```

Everything uses the same builder.

---

# Forms

Purpose

Registration experience builder.

NOT Google Forms.

Sections

```

Templates

Published

Drafts

Responses

Analytics

```

Builder Flow

```

Choose Template

↓

Build

↓

Conditional Logic

↓

Theme

↓

Preview

↓

Publish

↓

Link to Event

```

---

## Form Builder Layout

```

┌────────────┬────────────────────────────┬──────────────┐

Blocks        Live Canvas                 Inspector

└────────────┴────────────────────────────┴──────────────┘

```

Blocks

```

Section

Heading

Paragraph

Divider

Image

Video

Map

FAQ

Timeline

Countdown

Short Answer

Email

Dropdown

Checkbox

Payment

File Upload

Signature

QR

Custom HTML

```

Every field is draggable.

Every section is draggable.

Everything updates live.

---

# Members

Purpose

CRM

NOT spreadsheet.

Sections

```

All Members

Committee

Active

Alumni

Pending

Tags

Attendance

Exports

```

Each Member

```

Profile

Roles

Attendance

Participation

Certificates

History

```

---

# Executive Committee

Purpose

Year based organizational structure.

Landing

```

2026-27 Committee

```

View

```

Organization Chart

```

Each Member

```

Photo

Role

Bio

Socials

Responsibilities

Email

Visibility

Display Order

```

End of Year Flow

```

Duplicate Committee

↓

Replace Members

↓

Publish

```

---

# Applications

Purpose

Pipeline.

NOT table.

Flow

```

Submitted

↓

Under Review

↓

Interview

↓

Accepted

↓

Rejected

```

Drag and drop Kanban.

---

# Media Library

Purpose

Digital Asset Manager

Folders

```

Events

Posts

People

Documents

Sponsors

Brand Assets

Icons

Videos

Templates

```

Each Asset

```

Preview

Usage

Alt Text

Version History

Tags

Folder

```

---

# Website

Purpose

Manage website structure.

Sections

```

Site Structure

Navigation

Pages

Global Components

Theme

SEO

Footer

Homepage

```

Site Structure

```

Home

About

Events

Posts

Join

Contact

```

Drag to reorder.

---

# Settings

```

General

Brand

Users

Permissions

Storage

Email

Domains

API

Logs

Backups

```

---

# Builder Philosophy

Every editable module uses

```

Blocks

↓

Canvas

↓

Inspector

```

Never giant forms.

---

# Visual Language

Inspired by

- Linear
- Notion
- Framer
- Figma
- Arc Browser

Avoid

- WordPress
- Bootstrap Admin
- Generic SaaS Dashboards

---

# UI Style

Primary Colors

- White
- Navy
- Science Club Red

Accent

- Soft Grey

Avoid

- Glassmorphism
- Neon
- Random Gradients
- Generic SaaS Blues

---

# Interaction Principles

- Command Palette
- Keyboard Shortcuts
- Autosave
- Live Preview
- Drag & Drop
- Undo / Redo
- Right-side Inspector
- Block Library
- Context Menus
- Templates Everywhere

---

# Universal Builder

Every builder shares the same interface.

```

┌──────────────┬─────────────────────────────────────┬─────────────┐

Block Library      Canvas / Live Preview               Inspector

└──────────────┴─────────────────────────────────────┴─────────────┘

```

Users learn once.

Everything feels familiar.

---

# Templates

Every module supports templates.

Examples

Events

- Workshop
- Hackathon
- Seminar
- Competition
- Conference

Posts

- News
- Research
- Article
- Announcement

Forms

- Registration
- Membership
- Speaker
- Volunteer

Executive Committee

- Annual Committee

Pages

- Landing Page
- About
- Join
- Contact

---

# Playbooks

This is the biggest differentiator.

Instead of creating records...

Users launch workflows.

---

## Organize Workshop

Automatically creates

- Event
- Registration Form
- Banner Placeholder
- Announcement Draft
- Checklist
- Automation Rules
- Post Event Report

---

## New Executive Committee

Automatically

- Duplicate Previous Committee
- Archive Previous Year
- Replace Members
- Preserve Roles
- Publish New Committee

---

## Publish Research

Automatically creates

- Research Post
- Author Profiles
- Citation Section
- Download Attachments
- DOI Links
- SEO Metadata

---

## New Member Intake

Automatically creates

- Application Form
- Member Pipeline
- Welcome Email
- Review Board
- Acceptance Workflow

---

# Command Palette

Accessible everywhere.

```

⌘K

Create Event

Create Post

Create Form

Open Draft

Search Members

Go to Applications

Upload Media

Publish Draft

```

---

# Core Philosophy

The admin should never feel like they're editing database records.

They should feel like they're running the Science Club.

Everything should revolve around:

- Workspaces
- Visual Builders
- Templates
- Playbooks
- Automation
- Modular Systems
- Beautiful Student Experiences

This is an Organization Operating System, not a CRUD CMS.