'use client'

import { CopyableValue } from '@/components/ui/copyable-value'

export default function TestCopyPage() {
  return (
    <div className="app-container py-8 space-y-8">
      <h1 className="text-3xl font-bold">CopyableValue Component Test</h1>
      
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Hash Values</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Block Hash</label>
              <div className="mt-1">
                <CopyableValue
                  value="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                  truncate={true}
                  truncateStart={10}
                  truncateEnd={10}
                  className="text-sm bg-muted px-2 py-1 rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Extrinsic Hash</label>
              <div className="mt-1">
                <CopyableValue
                  value="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
                  truncate={true}
                  truncateStart={8}
                  truncateEnd={8}
                  valueClassName="text-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Numbers and IDs</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Block Number</label>
              <div className="mt-1">
                <CopyableValue
                  value="1234567"
                  displayValue="#1,234,567"
                  monospace={true}
                  valueClassName="text-blue-600 font-bold"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">App ID</label>
              <div className="mt-1">
                <CopyableValue
                  value="42"
                  showCopyButton="always"
                  buttonSize="md"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Addresses</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Address</label>
              <div className="mt-1">
                <CopyableValue
                  value="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                  truncate={true}
                  truncateStart={8}
                  truncateEnd={8}
                  valueClassName="text-purple-600"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Validator Address</label>
              <div className="mt-1">
                <CopyableValue
                  value="5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"
                  truncate={true}
                  truncateStart={6}
                  truncateEnd={6}
                  valueClassName="text-green-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Table-like Layout</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Hash:</span>
              <CopyableValue
                value="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                truncate={true}
                truncateStart={10}
                truncateEnd={10}
                valueClassName="text-blue-600"
              />
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Block:</span>
              <CopyableValue
                value="1234567"
                displayValue="#1,234,567"
                valueClassName="text-blue-600"
              />
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Signer:</span>
              <CopyableValue
                value="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                truncate={true}
                truncateStart={8}
                truncateEnd={8}
                valueClassName="text-purple-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 