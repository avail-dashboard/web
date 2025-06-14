'use client'

import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ExtrinsicsFiltersProps {
  blockFilter: string
  setBlockFilter: (value: string) => void
  signerFilter: string
  setSignerFilter: (value: string) => void
  methodFilter: string
  setMethodFilter: (value: string) => void
  successFilter: string
  setSuccessFilter: (value: string) => void
  onClearFilters: () => void
}

export function ExtrinsicsFilters({
  blockFilter,
  setBlockFilter,
  signerFilter,
  setSignerFilter,
  methodFilter,
  setMethodFilter,
  successFilter,
  setSuccessFilter,
  onClearFilters,
}: ExtrinsicsFiltersProps) {
  const hasActiveFilters = blockFilter || signerFilter || methodFilter || successFilter !== 'all'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        <CardDescription>
          Filter extrinsics by block, signer, method, or success status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Block Number</label>
            <Input
              placeholder="e.g., 12345"
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              type="number"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Signer</label>
            <Input
              placeholder="Address or partial..."
              value={signerFilter}
              onChange={(e) => setSignerFilter(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Method</label>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All methods</SelectItem>
                <SelectItem value="balances">Balances</SelectItem>
                <SelectItem value="timestamp">Timestamp</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="staking">Staking</SelectItem>
                <SelectItem value="dataAvailability">Data Availability</SelectItem>
                <SelectItem value="vector">Vector</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={successFilter} onValueChange={setSuccessFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success only</SelectItem>
                <SelectItem value="failed">Failed only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClearFilters}>
              Clear all filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}