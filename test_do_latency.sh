#!/bin/bash

echo "Testing DigitalOcean datacenter latencies to Avail RPC..."
echo "=================================================="

# DigitalOcean speedtest endpoints for major regions
declare -A do_regions=(
    ["NYC1"]="speedtest-nyc1.digitalocean.com"
    ["NYC3"]="speedtest-nyc3.digitalocean.com"
    ["SFO3"]="speedtest-sfo3.digitalocean.com"
    ["TOR1"]="speedtest-tor1.digitalocean.com"
    ["LON1"]="speedtest-lon1.digitalocean.com"
    ["AMS3"]="speedtest-ams3.digitalocean.com"
    ["FRA1"]="speedtest-fra1.digitalocean.com"
    ["SGP1"]="speedtest-sgp1.digitalocean.com"
    ["BLR1"]="speedtest-blr1.digitalocean.com"
    ["SYD1"]="speedtest-syd1.digitalocean.com"
)

echo "First, testing from your current location to Avail RPC:"
ping -c 3 mainnet-rpc.avail.so | tail -1

echo ""
echo "Now testing latency from your location to DO datacenters:"
echo "Region    | Datacenter                     | Avg Latency"
echo "----------|--------------------------------|------------"

for region in "${!do_regions[@]}"; do
    endpoint="${do_regions[$region]}"
    result=$(ping -c 3 "$endpoint" 2>/dev/null | tail -1 | grep -o 'avg/[0-9.]*' | cut -d'/' -f2)
    if [ -n "$result" ]; then
        printf "%-9s | %-30s | %s ms\n" "$region" "$endpoint" "$result"
    else
        printf "%-9s | %-30s | TIMEOUT\n" "$region" "$endpoint"
    fi
done

echo ""
echo "Recommendation: Choose the region with lowest latency that's also"
echo "geographically close to Toronto, Canada (where Avail RPC is located)" 