# DecentraMind Product Requirements Document

## Overview
DecentraMind is a decentralized platform built on AO, a hyper parallel computer that enables distributed compute. The platform leverages AO's process-based architecture to facilitate community building, task management, and reward distribution in a truly decentralized manner.

## Core Features

### 1. User Management
- **User Registration and Login**
  - Support Wander wallet login
  - Profile customization with username and avatar
  - X (Twitter) based Vouch verification system
    - Users need to get X account verification through https://vouch.zeabur.app/
    - Login flow: Connect wallet -> Vouch verification -> Login
    - Support verification status check and retry mechanism

- **User Profile**
  - View and update user information
  - Track user participation in communities and tasks
  - View user's bounty history (published and awarded)

### 2. Community Management

#### Community Creation and Settings
- **Community Creation**
  - Create new communities with unique UUIDs
  - Set community details (name, description, logo, banner)
  - Configure community tokens and supply
  - Assign community owner and administrators

- **Community Administration**
  - Update community settings and information
  - Manage community admins
  - Configure Private Quest Space access questions
  - Mute/unmute community members

#### Community Membership
- **Joining Communities**
  - Users can join communities
  - Support for invite-based joining
  - Track member join timestamps
  - Exit community functionality (except for owners)

- **Private Quest Space Access**
  - Set up screening questions for Private Quest Space access
  - Submit and review answers to access questions
  - Track application status

### 3. Public Task Management

#### Public Task Creation and Configuration
- **Task Types Support**
  - Space tasks
  - Promotion tasks (requires link)
  - Bird tasks
  - Good Read tasks
  - [ ] invite tasks

- **Public Task Settings**
  - Configure task details (name, intro, rules, banner)
  - Set task duration (start time, end time)
  - Define total chances
  - Configure bounty rewards

#### Public Task Participation
- **Builder Management**
  - Join tasks through wallet verification and vouch check
  - Support auto-join via invitation links
  - Track builder participation status
  - Generate and share task invitation links
  - Share tasks to Twitter with invitation links

- **Submission System**
  - Submit task solutions based on task type:
    - Space tasks: Submit Space URL
    - Promotion tasks: Submit Tweet URL
    - Bird tasks: Submit Tweet URL
    - Good Read tasks: Submit Tweet URL
  - Track submission status and timestamps
  - Support resubmission for invalid submissions
  - View submission transaction history through ao.link

- **Submission Management**
  - View all submissions in a paginated table
  - Search and filter submissions
  - Track submission validation status:
    - Waiting for validation
    - Validated
    - Invalid
    - Validation error
    - Revalidated
  - Display submission details:
    - Submission ID
    - Submitter address
    - Submission URL
    - Validation status
    - Submission time
    - Score (after calculation)
    - Awarded bounties

- **Task Progress Tracking**
  - Display current builder count
  - Show task status (not started/in progress/ended)
  - Track submission deadlines
  - View last update timestamps

#### Public Task Evaluation
- **Submission Validation**
  - Validate submissions
  - Track validation status
  - Support revalidation process
  - Record validation errors

- **Scoring System**
  - Calculate and update submission scores
  - Support different scoring criteria based on task type
  - Track score calculation status

### 4. Bounty System

#### Bounty Management
- **Bounty Configuration**
  - Set bounty amounts and tokens
  - Configure bounty distribution rules
  - Support multiple bounty types per task

- **Bounty Distribution**
  - Track bounty send history
  - Record sender and recipient information
  - Store bounty transaction details
  - Mark tasks as settled after distribution

#### Bounty Tracking
- **History and Reports**
  - View all bounties
  - Filter bounties by community
  - Track personal bounty history
  - View published and awarded bounties

### 5. Invite System

#### Invite Management
- **Invite Code Generation**
  - Generate unique invite codes
  - Support community-level invites
  - Support task-level invites
  - Track invite code usage

- **Invite Tracking**
  - Record inviter and invitee relationships
  - Track invite acceptance timestamps
  - View invite usage statistics

### 4. Private Quest Space

#### Private Quest Space Management
- **Member Management**
  - [ ] Members can apply to join Private Quest Space
  - [ ] Admins can approve/reject applications
  - [ ] Admins can remove members from Private Quest Space
  - [ ] Admins can view pending and current members
  - [ ] Admins can view membership history (actions, executing admin, member)
  - [ ] Invite community members to Private Quest Space
  - [ ] Community members can view invitations
  - [ ] Community members can accept invitations
- **Private Quest Space Settings**
  - [ ] Admins can set questions for Private Quest Space applications
  - [ ] Editable collaboration areas (add, delete)
  - [ ] Editable navigation bar (add, delete)
