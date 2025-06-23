// Comprehensive Subscan Avail Explorer Analysis
// Documentation of all features, pages, and data structures found at https://avail.subscan.io

const SUBSCAN_AVAIL_ANALYSIS = {
  metadata: {
    website: "https://avail.subscan.io",
    title: "Subscan | Aggregate Substrate ecological network high-precision Web3 explorer",
    description: "Complete blockchain explorer for Avail Data Availability layer",
    lastAnalyzed: "2025-01-23",
    network: "mainnet",
    specVersion: 48
  },

  // Main Navigation Structure
  navigation: {
    header: {
      logo: "subscan",
      networkInfo: {
        token: "AVAIL",
        price: "$0.0227",
        priceChange: "-2.04%",
        network: "mainnet Avail"
      },
      searchBar: {
        placeholder: "Search by Block / Extrinsic / Event / Account / Token",
        categories: ["All", "Block", "Extrinsic", "Event", "Account", "Token"]
      }
    },

    mainMenu: {
      blockchain: {
        title: "Blockchain",
        type: "dropdown",
        items: [
          { name: "Blocks", url: "/block" },
          { name: "Extrinsics", url: "/extrinsic" },
          { name: "Transfers", url: "/transfer" },
          { name: "Data Submission", url: "/data_submission_list" },
          { name: "Logs", url: "/log" }
        ]
      },
      staking: {
        title: "Staking", 
        url: "/validator",
        type: "direct_link"
      },
      governance: {
        title: "Gov",
        type: "dropdown", 
        items: [
          { name: "Preimage", url: "/preimage" },
          { name: "Bounties", url: "/bounty" },
          { name: "Tech. comm. Proposals", url: "/tech" },
          { name: "Treasury Proposals", url: "/treasury" }
        ]
      },
      tools: {
        title: "Tools",
        type: "dropdown",
        items: [
          { name: "Charts", url: "/tools/charts" },
          { name: "Account Format Transform", url: "/tools/format_transform" },
          { name: "Price Converter", url: "/tools/price_converter" },
          { name: "Runtime", url: "/runtime" },
          { name: "API Docs", url: "https://support.subscan.io/" },
          { name: "Get API Key", url: "https://pro.subscan.io/" }
        ]
      }
    }
  },

  // Dashboard/Homepage Structure
  homepage: {
    sections: {
      basicInfo: {
        title: "Basic Info",
        icon: "focus",
        content: {
          networkName: "Avail",
          specVersion: {
            label: "Spec Version:",
            value: "48",
            link: "/runtime"
          },
          tokenInfo: {
            symbol: "AVAIL",
            price: "$0.02277378",
            change: "-2.04%"
          },
          externalLinks: [
            { platform: "website", url: "https://www.availproject.org/" },
            { platform: "twitter", url: "https://x.com/AvailProject" },
            { platform: "github", url: "https://github.com/availproject" }
          ]
        }
      },

      chainData: {
        title: "Chain Data",
        metrics: [
          {
            label: "Finalized Blocks",
            value: "1,527,872",
            link: "/block",
            icon: "block"
          },
          {
            label: "Signed Extrinsics", 
            value: "632,564",
            link: "/extrinsic",
            icon: "extrinsic"
          },
          {
            label: "Staked / Bonded",
            value: "5.19B / 5.194B",
            link: "/validator",
            icon: "staking"
          },
          {
            label: "Holders / Total Accounts",
            value: "203,469 / 288,731", 
            link: "/account",
            icon: "accounts"
          },
          {
            label: "Transfers",
            value: "649,917",
            link: "/transfer",
            icon: "transfer"
          },
          {
            label: "Inflation Rate",
            value: "4.96%",
            link: "/validator",
            icon: "inflation"
          }
        ]
      },

      chainStatus: {
        title: "Chain Status",
        charts: {
          tabs: ["Data", "AVAIL Price", "Volume"],
          timeFilters: ["1D", "7D", "1M"],
          moreChartsLink: "/tools/charts"
        }
      },

      tokenDistribution: {
        title: "Token Distribution",
        totalIssuance: "10.485B",
        breakdown: [
          {
            category: "Circulating",
            amount: "1.921B",
            percentage: "18.32%",
            detailLink: true
          },
          {
            category: "Staking", 
            amount: "5.194B",
            percentage: "49.53%"
          },
          {
            category: "Treasury",
            amount: "241.453M", 
            percentage: "2.30%"
          },
          {
            category: "Others",
            amount: "3.128B",
            percentage: "29.83%",
            detailLink: true
          }
        ]
      },

      latestBlocks: {
        title: "Latest Blocks",
        viewAllLink: "/block",
        columns: ["Block#", "Includes", "Time", "Status"],
        sampleData: [
          {
            blockNumber: "1,527,880",
            includes: "3 Extrinsics",
            time: "30 secs ago",
            status: "waiting"
          }
        ]
      },

      transfers: {
        title: "Transfers",
        tabs: ["Latest", "Large"],
        viewAllLink: "/transfer",
        columns: ["Extrinsic#", "From", "To", "Amount", "Time"],
        sampleData: [
          {
            extrinsic: "1527875-1",
            from: "Pool#1....eward)",
            to: "5GRFPC....WBfPp5", 
            amount: "89.613 AVAIL",
            time: "2 mins ago"
          }
        ]
      }
    }
  },

  // Page Structures and Data Models
  pages: {
    blocks: {
      url: "/block",
      title: "Block List",
      features: {
        pagination: {
          pageSize: 25,
          navigation: "numbered with previous/next"
        },
        downloadData: true,
        columns: [
          {
            name: "Block",
            type: "link",
            description: "Block number linking to block detail"
          },
          {
            name: "Status", 
            type: "status_icon",
            values: ["waiting", "finalized"],
            description: "Block finalization status"
          },
          {
            name: "Time",
            type: "relative_time",
            description: "Time since block creation"
          },
          {
            name: "Extrinsics",
            type: "count_link", 
            description: "Number of extrinsics, links to block extrinsics tab"
          },
          {
            name: "Data Submission",
            type: "count_link",
            description: "Number of data submissions, links to block data submission tab"
          },
          {
            name: "Validator",
            type: "validator_link",
            description: "Block producer name or address"
          },
          {
            name: "Block hash",
            type: "hash_link",
            description: "Block hash linking to block detail"
          }
        ],
        sampleData: [
          {
            block: "1527881",
            status: "waiting",
            time: "25 secs ago", 
            extrinsics: 2,
            dataSubmissions: "Loading",
            validator: "Enigma",
            hash: "0xaa7f....fc29db"
          }
        ]
      }
    },

    dataSubmissions: {
      url: "/data_submission_list",
      title: "Data Submission History",
      features: {
        timeFilters: ["1H", "6H", "1D"],
        filterButton: true,
        totalDataStats: {
          label: "Total Data:",
          value: "45.059 GB"
        },
        submissionCount: "159023",
        pagination: {
          pageSize: 25,
          totalPages: 400
        },
        downloadData: true,
        columns: [
          {
            name: "Extrinsic ID",
            type: "link",
            description: "Links to extrinsic detail"
          },
          {
            name: "App ID", 
            type: "number",
            description: "Application identifier"
          },
          {
            name: "Size",
            type: "formatted_size",
            description: "Data size in KB with decimal precision"
          },
          {
            name: "Submit by",
            type: "account_link",
            description: "Account that submitted the data"
          },
          {
            name: "Data Hash",
            type: "hash",
            description: "Hash of submitted data"
          }
        ],
        sampleData: [
          {
            extrinsicId: "1527853-1",
            appId: "39",
            size: "975.456 KB",
            submitBy: "5EHoP9....pjhXDq",
            dataHash: "0x74fe67b8a137568ea60c5d69729de5aa58e3094a0a9a6d832468d29d55f9eaf2"
          }
        ]
      }
    },

    charts: {
      url: "/tools/charts",
      title: "Chart Center",
      availableCharts: [
        {
          name: "Daily Transfer Amount",
          type: "financial_chart",
          metric: "transfer_volume"
        },
        {
          name: "Daily Signed Extrinsic Number", 
          type: "activity_chart",
          metric: "extrinsic_count"
        },
        {
          name: "Daily Unsigned Extrinsic Number",
          type: "activity_chart", 
          metric: "unsigned_extrinsic_count"
        },
        {
          name: "Daily Data Submissions Number",
          type: "data_availability_chart",
          metric: "data_submission_count",
          isAvailSpecific: true
        },
        {
          name: "Daily Data Submissions Size",
          type: "data_availability_chart",
          metric: "data_submission_volume", 
          isAvailSpecific: true
        },
        {
          name: "AVAIL Price",
          type: "price_chart",
          metric: "token_price"
        },
        {
          name: "Daily Active Account & Newly Created Account",
          type: "user_activity_chart",
          metric: "account_activity"
        },
        {
          name: "Daily Holder",
          type: "user_metrics_chart", 
          metric: "holder_count"
        },
        {
          name: "Daily Total Account",
          type: "user_metrics_chart",
          metric: "total_accounts"
        },
        {
          name: "Daily Fees Used",
          type: "economic_chart",
          metric: "fee_usage"
        },
        {
          name: "Daily Average Block Time",
          type: "performance_chart",
          metric: "block_time"
        },
        {
          name: "Daily Native Token Circulating Supply",
          type: "monetary_chart",
          metric: "circulating_supply"
        }
      ],
      features: {
        downloadPageData: true,
        individualChartViews: true
      }
    },

    extrinsics: {
      url: "/extrinsic", 
      title: "Extrinsic List",
      description: "List of all blockchain transactions/operations"
    },

    transfers: {
      url: "/transfer",
      title: "Transfer List", 
      description: "Token transfer transactions"
    },

    validators: {
      url: "/validator",
      title: "Validator/Staking Information",
      description: "Network validators and staking data"
    },

    accounts: {
      url: "/account",
      title: "Account List",
      description: "Blockchain accounts and holders"
    },

    governance: {
      preimage: { url: "/preimage" },
      bounties: { url: "/bounty" },
      techProposals: { url: "/tech" }, 
      treasuryProposals: { url: "/treasury" }
    },

    tools: {
      runtime: { url: "/runtime" },
      formatTransform: { url: "/tools/format_transform" },
      priceConverter: { url: "/tools/price_converter" }
    }
  },

  // Data Availability Specific Features (Avail-specific)
  availSpecificFeatures: {
    dataSubmissions: {
      description: "Core Avail DA functionality - tracks data submitted to availability layer",
      metrics: [
        "Total submissions count",
        "Total data volume (GB)",
        "Submission frequency", 
        "Application IDs",
        "Data sizes",
        "Success rates"
      ],
      chartTypes: [
        "Daily Data Submissions Number",
        "Daily Data Submissions Size"
      ]
    },

    blockDataSubmissions: {
      description: "Each block shows data submission count",
      integration: "Blocks table includes 'Data Submission' column",
      linkage: "Links to block's data submission tab"
    },

    applications: {
      description: "App IDs represent different applications using Avail DA",
      tracking: "Individual application submission tracking",
      examples: ["App ID 39", "App ID 30", "App ID 25", "App ID 19", "App ID 17", "App ID 32"]
    }
  },

  // Chart Configuration and Visualization Capabilities
  chartingCapabilities: {
    timeFilters: {
      standard: ["1D", "7D", "1M"],
      dataSubmissions: ["1H", "6H", "1D"]
    },
    
    chartTypes: {
      financial: ["Price", "Transfer Amount", "Fees Used", "Circulating Supply"],
      activity: ["Extrinsic Count", "Account Activity", "Block Time"],
      dataAvailability: ["Data Submissions Number", "Data Submissions Size"],
      user: ["Active Accounts", "Holders", "Total Accounts"]
    },

    visualizationFeatures: {
      downloadData: true,
      pagination: true,
      realTimeUpdates: false, // Static daily aggregation observed
      interactiveFiltering: true,
      exportFormats: ["Download page data"] // Format not specified
    }
  },

  // API and Integration Potential
  integrationPoints: {
    subscanAPI: {
      baseUrl: "https://support.subscan.io/",
      apiKeyRequired: true,
      apiKeyUrl: "https://pro.subscan.io/"
    },

    dataEndpoints: {
      estimated: [
        "/api/scan/blocks",
        "/api/scan/extrinsics", 
        "/api/scan/transfers",
        "/api/scan/data_submissions", // Avail-specific
        "/api/scan/validators",
        "/api/scan/accounts",
        "/api/scan/charts/daily_data_submissions", // Avail-specific
        "/api/scan/charts/daily_data_size" // Avail-specific
      ]
    }
  },

  // Technical Architecture Insights
  technicalInsights: {
    framework: "Substrate-based blockchain explorer",
    realTimeCapabilities: "Live block updates, 'waiting' status for recent blocks",
    
    dataStructure: {
      blocks: {
        hasDataSubmissions: true,
        statusTracking: true,
        validatorInfo: true
      },
      
      dataSubmissions: {
        appIdTracking: true,
        sizeTracking: true,
        hashVerification: true,
        submitterTracking: true
      }
    },

    userExperience: {
      navigation: "Dropdown menus with comprehensive categorization",
      search: "Universal search across all entity types",
      pagination: "Standard 25 items per page",
      dataExport: "Download functionality on list pages",
      responsiveness: "Web-based interface" 
    }
  },

  // Opportunities for API Enhancement
  enhancementOpportunities: {
    realTimeFeatures: [
      "WebSocket connections for live updates",
      "Real-time data submission tracking",
      "Live validator status updates"
    ],

    advancedFiltering: [
      "Custom date range selection",
      "App ID filtering",
      "Data size range filtering", 
      "Success/failure status filtering",
      "Validator-specific filtering"
    ],

    chartEnhancements: [
      "Hourly granularity (currently only daily)",
      "Interactive zoom and pan",
      "Multi-metric overlay charts",
      "Comparative time period analysis",
      "Custom aggregation periods"
    ],

    dataAvailabilitySpecific: [
      "App-specific dashboards",
      "Data submission success rates",
      "DA proof verification metrics",
      "Cross-rollup analytics",
      "Performance benchmarking"
    ]
  },

  // Footer and Additional Info
  footer: {
    company: "Subscan © 2025 - Developed by Subscan Team",
    links: [
      "Version History",
      "Privacy Policy", 
      "Terms of Use",
      "Open Source Notices",
      "Service Status",
      "Feedback",
      "Career"
    ],
    social: ["Twitter", "GitHub", "Element", "Medium"],
    contact: "hello@subscan.io",
    donation: {
      address: "5EX4R92h5EttLhchZvzfMHGu8arTYvyocZw3NwgYrdsVJLKT",
      otherTokens: "https://www.subscan.io/donate"
    }
  }
};

// Chart Type Recommendations for Different Data
const CHART_TYPE_RECOMMENDATIONS = {
  dataSubmissionVolume: {
    recommended: ["line_chart", "area_chart"],
    timeGranularity: ["hourly", "daily", "weekly"],
    aggregations: ["sum", "average"], 
    description: "Track data volume over time"
  },

  dataSubmissionCount: {
    recommended: ["bar_chart", "line_chart"],
    timeGranularity: ["hourly", "daily"],
    aggregations: ["count"],
    description: "Track submission frequency"
  },

  applicationActivity: {
    recommended: ["stacked_bar_chart", "grouped_bar_chart"],
    groupBy: ["app_id"],
    description: "Compare activity across applications"
  },

  blockUtilization: {
    recommended: ["heatmap", "line_chart"],
    metrics: ["data_submission_count_per_block", "extrinsic_count_per_block"],
    description: "Visualize block space usage"
  },

  validatorPerformance: {
    recommended: ["scatter_plot", "bar_chart"],
    metrics: ["blocks_produced", "data_submissions_included"],
    description: "Compare validator activity"
  }
};

// Data Model Merging Opportunities
const DATA_MERGING_OPPORTUNITIES = {
  blockDataSubmissions: {
    primaryEntity: "blocks",
    mergeWith: ["data_submissions", "extrinsics"],
    benefits: "Complete block activity view",
    implementation: "Join on block_number/block_hash"
  },

  applicationDashboards: {
    primaryEntity: "applications",
    mergeWith: ["data_submissions", "blocks", "accounts"],
    benefits: "App-specific analytics",
    implementation: "Group by app_id with temporal aggregation"
  },

  validatorAnalytics: {
    primaryEntity: "validators", 
    mergeWith: ["blocks", "data_submissions", "extrinsics"],
    benefits: "Comprehensive validator performance",
    implementation: "Join on validator address/identity"
  },

  userActivity: {
    primaryEntity: "accounts",
    mergeWith: ["transfers", "data_submissions", "extrinsics"],
    benefits: "Complete user activity profile", 
    implementation: "Join on account address"
  }
};

export {
  SUBSCAN_AVAIL_ANALYSIS,
  CHART_TYPE_RECOMMENDATIONS, 
  DATA_MERGING_OPPORTUNITIES
};