# Avail DA Explorer Scope

## 1. Data Scope

### Network Statistics

- **General Statistics**: Total Blocks, Total Extrinsics, Total Blobs Size, Total Fees
- **Data Throughput Tracking**: Real-time monitoring of data flow
- **DA Contribution Graph**: Percentage share of each rollup in total DA submission (calculated daily, weekly, monthly)
- **Cost per MB of Data**: Pricing analytics for data availability

### Gas and Fee Tracking

- **Gas Price Tracker**: Hourly average for the past 7 days
- **Gas Efficiency**: Gas used / Gas Limit ratio
- **Cost per Transaction**: Hourly average for the past 1 day
- **Cost per Block**: Hourly average for the past 1 day

### Rollup/App-Space Tracking

- **Rollup Overview Page**:
  - Rollup Name
  - Last Active
  - Size
  - Blobs
  - Blob Fees Paid
  - Paid per MB
- **Detailed Rollup View**:
  - Size
  - Blobs
  - Blob Fees Paid
  - First Seen
  - Last Active
- **List of Blobs for each Rollup**:
  - Signer
  - Time
  - Share Commitments
  - Size
- **Analytics per Rollup** (24h/Week/Month):
  - DA Usage
  - Blob Count
  - Fee Paid
  - Blob Size

### Blocks Data

- Timestamp
- Block Time
- Status
- Hash
- Parent Hash
- State Root
- Extrinsics Root
- Validator Information
- Spec Version
- Cost per Block

### Extrinsics

- **List View**:
  - ID
  - Hash
  - Data Submission Status
  - Time
  - Result
  - Action
- **Detailed View**:
  - Timestamp
  - Block
  - Lifetime
  - Hash
  - Action
  - Asset Transfers
  - Sender
  - Fees
  - Nonce
  - Result
  - Parameters
  - Signature Information
  - Cost per Tx

### Account Profiles

- **Balances and Role**
- **History of**:
  - Extrinsics
  - Transfers
  - Rewards
  - Balances

### Events

_Shown inside Extrinsics and Blocks_

- ID
- Action
- Type

### Data Submissions

- **List View**:
  - Extrinsic ID
  - Rollup Name
  - Size
  - Submitter
  - Data Hash

### Logs

_Shown inside Extrinsics and Blocks_

- **List View**:
  - LogIndex
  - Block
  - Type
  - Engine

### Transfers

- **AVAIL Transfer Indexing**:
  - From Address
  - To Address
  - Events Emitted
  - Fees
  - Block Number
  - Extrinsic Hash
  - Parameters
  - Signature
  - Assets Flow
  - Status

### Staking and Validation

- **Validator List**:
  - Active
  - New Entrants
  - Waiting
  - Slashed
- **Detailed Validator Info**:
  - Stash and Controller Addresses
  - Nominator Count
  - Commission Rate
  - Session Keys
  - Self-Bonded
  - Total Bonded
  - Nominators
  - List of Rewards
  - List of Blocks Proposed
  - Slashing Events
- **Nomination Pools**
- **Nominator Info**:
  - Bonded Amount
  - Reward Lists
  - Stash, Controller and Reward Addresses
- **Era and Epoch Tracking**

### Validator Statistics

- Total Staking Amount (Validator vs Nominator)
- Inflation Rate
- Minimum Stake Requirement

## 2. Explorer Features

### Core Functionality

- **Search Functionality**: Blocks, extrinsics, addresses, app spaces
- **Easy Navigation**: Between related entities (e.g., from block to extrinsics to events)
- **Detailed Views**: Blocks, extrinsics, addresses, validators and rollups
- **Filtered Extrinsics View**: Only Data Submission transactions
- **Blobs**: Content decoding and downloads
- **Analytics**: Network activity monitoring
- **Gas Tracker**: Cost estimation tooling
- **App Space Views**: Rollup analytics
- **API Services**: Endpoints for all data points and documentation for API usage
- **Avail Light Client Integration**:
  - Ability to run Light client
  - Check status and sync information

## 3. User Interface

### Main Sections

- **Home Page**: Network overview and recent activity for all entities
- **Dedicated Sections**:
  - Blocks
  - Extrinsics
  - Rollups
  - Accounts
  - Validators

## 4. Dedicated Sections

### Blocks Section

#### Block List View
- **Table Layout**:
  - Block Number (clickable, descending order)
  - Timestamp (relative and absolute)
  - Block Hash (truncated with copy functionality)
  - Validator (with avatar/icon)
  - Extrinsics Count
  - Data Size
  - Block Time
  - Status Indicator
- **Filtering Options**:
  - Date Range Picker
  - Validator Filter
  - Block Status Filter
  - Size Range Filter
- **Search Functionality**:
  - Search by block number, hash, or validator
  - Auto-complete suggestions
- **Pagination**: 25/50/100 blocks per page
- **Export Options**: CSV, JSON for filtered results

#### Block Detail View
- **Header Section**:
  - Block Number and Status Badge
  - Timestamp (with timezone)
  - Block Hash (full, with copy button)
  - Parent Hash (clickable link)
  - Navigation: Previous/Next block buttons
- **Block Information Panel**:
  - State Root
  - Extrinsics Root
  - Spec Version
  - Validator Information (with link to validator page)
  - Block Size and Data Throughput
  - Block Time and Network Latency
  - Cost per Block
- **Extrinsics Section**:
  - Embedded list of all extrinsics in block
  - Quick filters: Success/Failed, Data Submissions only
  - Sortable by index, type, result
- **Events Tab**:
  - All events emitted in the block
  - Grouped by extrinsic index
  - Event type filtering
- **Logs Tab**:
  - System logs and runtime logs
  - Engine type filtering
- **Raw Data Tab**:
  - JSON/SCALE encoded block data
  - Downloadable format options

### Extrinsics Section

#### Extrinsics List View
- **Table Layout**:
  - Extrinsic ID (Block#-Index format, clickable)
  - Hash (truncated with copy functionality)
  - Block Number (clickable link)
  - Timestamp (relative and absolute)
  - Module/Method (color-coded by type)
  - Signer (with identicon/avatar)
  - Result Status (Success/Failed with badge)
  - Fee Paid
  - Data Size (for data submissions)
- **Advanced Filtering**:
  - Module Filter (DataAvailability, Balances, Staking, etc.)
  - Method Filter (within selected module)
  - Status Filter (Success/Failed/Pending)
  - Date Range Picker
  - Signer Address Filter
  - Fee Range Filter
  - Data Submission Only Toggle
- **Search Functionality**:
  - Search by hash, signer address, or extrinsic ID
  - Auto-complete with recent searches
- **Sorting Options**: Timestamp, Fee, Block Number, Result
- **Pagination**: 25/50/100 extrinsics per page
- **Export Options**: CSV, JSON for filtered results

#### Extrinsic Detail View
- **Header Section**:
  - Extrinsic ID and Status Badge
  - Timestamp (with timezone)
  - Hash (full, with copy button)
  - Block Number (clickable link)
  - Navigation: Previous/Next extrinsic in block
- **Transaction Information Panel**:
  - Module and Method
  - Lifetime/Mortality Period
  - Nonce
  - Signature Information (Algorithm, Public Key)
  - Weight and Fee Breakdown
  - Priority and Tip
- **Signer Information**:
  - Address (with identicon)
  - Balance at time of transaction
  - Link to account profile
- **Parameters Tab**:
  - Decoded parameter values
  - Raw parameter data (hex/JSON)
  - Parameter type definitions
- **Events Tab**:
  - All events emitted by this extrinsic
  - Event index and data
  - Success/Error event highlighting
- **Data Submission Details** (if applicable):
  - App ID and Rollup Information
  - Data Size and Hash
  - Blob commitments
  - KZG proofs
  - Data availability confirmation
- **Asset Transfers** (if applicable):
  - From/To addresses
  - Amount and asset type
  - Transfer status and confirmations
- **Raw Data Tab**:
  - SCALE encoded extrinsic data
  - JSON representation
  - Downloadable formats

### Rollups Section

#### Rollup Overview/Leaderboard
- **Dashboard Layout**:
  - Total Active Rollups Count
  - Total Data Submitted (24h/7d/30d)
  - Total Fees Paid (24h/7d/30d)
  - Average Cost per MB across all rollups
- **Leaderboard Table**:
  - Rollup Name/App ID (with logo if available)
  - Status (Active/Inactive with last seen timestamp)
  - Data Volume (24h/7d/30d with trend indicators)
  - Blob Count (24h/7d/30d)
  - Total Fees Paid (24h/7d/30d)
  - Cost per MB (current rate)
  - First Seen Date
  - Market Share % (pie chart visualization)
- **Filtering Options**:
  - Status Filter (Active/Inactive/All)
  - Date Range for metrics
  - Sort by various metrics
- **Search**: Search by rollup name or App ID
- **Analytics Charts**:
  - DA Usage Distribution (pie chart)
  - Timeline charts for volume and fees
  - Market share trends over time

#### Individual Rollup Detail View
- **Header Section**:
  - Rollup Name and App ID
  - Status Badge (Active/Inactive)
  - Logo/Avatar
  - Quick Stats: Total data, Total blobs, Total fees
- **Overview Panel**:
  - First Seen Date
  - Last Active Timestamp
  - Total Data Submitted (lifetime)
  - Total Blobs Count
  - Total Fees Paid
  - Average Cost per MB
  - Current Market Share
- **Analytics Dashboard**:
  - **Data Usage Charts**:
    - Daily/Weekly/Monthly data volume
    - Blob count trends
    - Fee payment trends
    - Cost per MB over time
  - **Activity Heatmap**:
    - Submission frequency by hour/day
    - Peak usage periods identification
  - **Comparison Metrics**:
    - Performance vs other rollups
    - Market position trends
- **Data Submissions List**:
  - **Table Layout**:
    - Timestamp
    - Extrinsic Hash (clickable)
    - Block Number (clickable)
    - Submitter Address
    - Data Size
    - Fee Paid
    - Status (Success/Failed)
  - **Filtering**: Date range, submitter, status
  - **Pagination**: 25/50/100 submissions per page
- **Blob Management**:
  - **Blob List View**:
    - Blob Hash/Commitment
    - Timestamp
    - Size
    - KZG Proof Status
    - Data Availability Status
    - Download Options
  - **Blob Detail View**:
    - Full blob information
    - Data decoding (if possible)
    - Download raw data
    - Verification tools
- **Submitters Analysis**:
  - Top submitter addresses
  - Submission patterns
  - Fee spending analysis
- **API Integration**:
  - Dedicated API endpoints for rollup data
  - Real-time data feeds
  - Historical data exports

### Accounts Section

#### Account Profile View
- **Header Section**:
  - Account Address (full, with copy functionality)
  - Identicon/Avatar
  - Account Type Badge (Regular/Validator/Nominator/Pool)
  - QR Code for address
- **Balance Information Panel**:
  - **Current Balances**:
    - Free Balance
    - Reserved Balance
    - Locked Balance (staking, governance, etc.)
    - Total Balance
  - **Balance History Chart**:
    - Timeline visualization of balance changes
    - Transaction impact indicators
    - Staking reward accumulation
- **Account Roles & Permissions**:
  - Validator Status (if applicable)
  - Nominator Status (if applicable)
  - Pool Member Status (if applicable)
  - Governance participation level
  - Identity information (if set)

#### Account Activity Tabs
- **Extrinsics Tab**:
  - **Sent Transactions**:
    - Table with timestamp, hash, method, result, fee
    - Filter by module/method type
    - Success/failure status
  - **Received Events**:
    - Events where account was mentioned
    - Incoming transfers and rewards
  - **Pagination and Export**: CSV/JSON export options

- **Transfers Tab**:
  - **Outgoing Transfers**:
    - To Address, Amount, Timestamp, Status
    - Transfer type (Balance, Asset, etc.)
    - Associated fees
  - **Incoming Transfers**:
    - From Address, Amount, Timestamp, Status
    - Transfer source identification
  - **Transfer Analytics**:
    - Volume charts (daily/weekly/monthly)
    - Top counterparties
    - Transfer patterns analysis

- **Staking Activity Tab** (if applicable):
  - **Validator Information**:
    - Commission rate history
    - Self-bonded amount
    - Total bonded amount
    - Active/Inactive periods
    - Slash events (if any)
  - **Nominator Information**:
    - Nominated validators list
    - Stake distribution
    - Reward history
    - Nomination changes timeline
  - **Pool Participation**:
    - Pool membership details
    - Contribution amount
    - Reward sharing

- **Data Submissions Tab**:
  - List of data submissions by this account
  - Associated rollup/app ID
  - Submission frequency and patterns
  - Total data volume and fees paid

- **Rewards Tab**:
  - **Staking Rewards**:
    - Era-by-era reward breakdown
    - Validator vs nominator rewards
    - Reward rate analysis
  - **Other Rewards**:
    - Treasury tips
    - Bounty payments
    - Democracy proposal rewards

#### Account Analytics Dashboard
- **Activity Timeline**:
  - Interactive timeline of all account activity
  - Transaction density heatmap
  - Activity pattern analysis
- **Financial Summary**:
  - Total fees paid lifetime
  - Total rewards received
  - Net balance change over time
  - ROI calculations (for staking)
- **Network Participation**:
  - Contribution to network security (staking)
  - Data availability participation
  - Governance participation metrics
- **Risk Analysis**:
  - Slash history (if any)
  - Large transaction alerts
  - Unusual activity patterns

#### Account Search and Discovery
- **Search Functionality**:
  - Search by full or partial address
  - Search by identity name
  - ENS-style name resolution (if available)
- **Account Lists**:
  - Top accounts by balance
  - Most active accounts (by transaction count)
  - Top validators by stake
  - Recent new accounts
- **Filtering Options**:
  - By account type
  - By balance range
  - By activity level
  - By staking status

### Validators Section

#### Validator Overview Dashboard
- **Network Statistics Panel**:
  - Total Active Validators
  - Total Waiting Validators  
  - Total Stake Amount
  - Current Era Information
  - Next Election Countdown
  - Average Commission Rate
- **Validator Status Distribution**:
  - Active vs Waiting vs Inactive
  - Geographic distribution (if available)
  - Commission rate distribution
  - Stake distribution analysis

#### Validator List View
- **Main Validators Table**:
  - **Identity Column**:
    - Validator Name/Identity (if set)
    - Stash Address (with identicon)
    - Identity verification status
  - **Staking Information**:
    - Total Bonded Amount
    - Self-Bonded Amount
    - Nominator Count
    - Commission Rate
  - **Performance Metrics**:
    - Blocks Produced (current era)
    - Slash Count (lifetime)
    - Uptime Percentage
    - Performance Score
  - **Status Indicators**:
    - Active/Waiting/Inactive Badge
    - Last Active Session
    - Election Status
- **Advanced Filtering**:
  - Status Filter (Active/Waiting/All)
  - Commission Rate Range
  - Stake Amount Range
  - Performance Score Range
  - Identity Status (Verified/Unverified)
  - Geographic Location (if available)
- **Sorting Options**: Stake, Commission, Performance, Block Count
- **Search**: By name, identity, or stash address

#### Individual Validator Detail View
- **Header Section**:
  - Validator Identity/Name
  - Stash and Controller Addresses
  - Status Badge (Active/Waiting/Inactive)
  - Identity Information and Verification
  - Social Links (if provided)
- **Staking Information Panel**:
  - **Current Stake**:
    - Total Bonded Amount
    - Self-Bonded Amount
    - Nominator Stake Amount
    - Stake Distribution Chart
  - **Commission & Settings**:
    - Current Commission Rate
    - Commission History Chart
    - Blocked Nominations Status
  - **Session Keys**:
    - All session keys with verification status
    - Key rotation history
- **Performance Analytics**:
  - **Block Production**:
    - Blocks produced per era (chart)
    - Expected vs actual blocks
    - Block production efficiency
    - Recent blocks list (with timestamps)
  - **Uptime Tracking**:
    - Session-by-session uptime
    - Offline events log
    - Uptime percentage trends
  - **Slash History**:
    - Any slashing events (with details)
    - Impact on stake and reputation
    - Recovery timeline
- **Nominator Management**:
  - **Nominator List**:
    - Nominator addresses
    - Stake amounts
    - Nomination duration
    - Reward sharing calculation
  - **Nominator Analytics**:
    - Top nominators by stake
    - Nominator retention rate
    - Stake concentration analysis
  - **Nomination Pool Info** (if applicable):
    - Pool membership details
    - Pool performance metrics
- **Rewards & Payouts**:
  - **Era Rewards**:
    - Rewards per era (chart)
    - Payout history
    - Commission earnings
  - **Payout Schedule**:
    - Upcoming payouts
    - Payout frequency
    - Auto-payout status
- **Technical Information**:
  - Node version and client info
  - Network connectivity status
  - Hardware specifications (if provided)
  - Geographic location (if available)

#### Validator Network Analytics
- **Era & Epoch Tracking**:
  - Current era progress
  - Era duration statistics
  - Election results history
  - Validator set changes
- **Network Health Metrics**:
  - Overall validator performance
  - Network decentralization index
  - Stake distribution analysis
  - Geographic distribution
- **Economic Analysis**:
  - Total inflation rate
  - Validator rewards distribution
  - Economic incentive alignment
  - Staking yield calculations
- **Waiting Queue Management**:
  - Waiting validators list
  - Queue position tracking
  - Election probability estimates
  - Minimum stake requirements

#### Nomination Pools Section
- **Pool Overview**:
  - Active nomination pools list
  - Total pooled stake
  - Pool performance comparison
- **Individual Pool Details**:
  - Pool ID and metadata
  - Pool owner and admin info
  - Member count and total stake
  - Nominated validators
  - Reward distribution history
  - Pool performance metrics
- **Pool Member Management**:
  - Member list and stakes
  - Joining/leaving history
  - Reward claims tracking

#### Staking Calculator & Tools
- **Reward Calculator**:
  - Estimate staking rewards
  - Validator selection impact
  - Commission rate comparison
- **Risk Assessment Tools**:
  - Validator risk scoring
  - Diversification recommendations
  - Slash risk analysis
- **Nomination Optimizer**:
  - Optimal validator selection
  - Stake distribution suggestions
  - Expected return calculations

### Analytics & Visualization

- **Rollup Leaderboard**: Analytics and heatmaps
- **Network and DA Statistics**: Charts and graphs
- **Staking and Validation Graphs**: Visual representation of staking data
- **Data Submission/Blob Analytics**: Comprehensive blob analysis

### User Experience Features

- **Bookmarks**: Track specific transactions
- **cmd + K Functionality**:
  - Perform explorer navigation
  - Run light clients
  - Transfer Avail to addresses
  - Submit data
  - Estimate fees
