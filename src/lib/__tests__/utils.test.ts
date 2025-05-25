import {
  cn,
  formatNumber,
  formatTokenAmount,
  formatAddress,
  formatTimeAgo,
  formatPercentage,
  generateColor,
  copyToClipboard,
  formatBlockNumber,
  calculatePercentageChange,
} from '../utils'

describe('Utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
    })

    it('should merge tailwind classes correctly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })
  })

  describe('formatNumber', () => {
    it('should format billions correctly', () => {
      expect(formatNumber(1500000000)).toBe('1.50B')
      expect(formatNumber(1000000000)).toBe('1.00B')
    })

    it('should format millions correctly', () => {
      expect(formatNumber(1500000)).toBe('1.50M')
      expect(formatNumber(1000000)).toBe('1.00M')
    })

    it('should format thousands correctly', () => {
      expect(formatNumber(1500)).toBe('1.50K')
      expect(formatNumber(1000)).toBe('1.00K')
    })

    it('should format small numbers correctly', () => {
      expect(formatNumber(999)).toBe('999')
      expect(formatNumber(123.456)).toBe('123.46')
    })

    it('should handle string inputs', () => {
      expect(formatNumber('1500000')).toBe('1.50M')
    })

    it('should handle invalid inputs', () => {
      expect(formatNumber('invalid')).toBe('0')
      expect(formatNumber(NaN)).toBe('0')
    })

    it('should respect custom decimal places', () => {
      expect(formatNumber(1500000, 1)).toBe('1.5M')
      expect(formatNumber(1500000, 3)).toBe('1.500M')
    })
  })

  describe('formatTokenAmount', () => {
    it('should format token amounts correctly', () => {
      expect(formatTokenAmount('1000000000000000000', 18, 4)).toBe('1')
      expect(formatTokenAmount('1500000000000000000', 18, 4)).toBe('1.5')
    })

    it('should handle different decimal places', () => {
      expect(formatTokenAmount('1000000', 6, 2)).toBe('1')
      expect(formatTokenAmount('1500000', 6, 2)).toBe('1.5')
    })

    it('should trim trailing zeros', () => {
      expect(formatTokenAmount('1100000000000000000', 18, 4)).toBe('1.1')
    })

    it('should handle zero amounts', () => {
      expect(formatTokenAmount('0', 18, 4)).toBe('0')
    })
  })

  describe('formatAddress', () => {
    const longAddress = '0x1234567890abcdef1234567890abcdef12345678'

    it('should format long addresses correctly', () => {
      expect(formatAddress(longAddress)).toBe('0x1234...345678')
    })

    it('should respect custom character count', () => {
      expect(formatAddress(longAddress, 4)).toBe('0x12...5678')
      expect(formatAddress(longAddress, 8)).toBe('0x123456...12345678')
    })

    it('should return short addresses unchanged', () => {
      const shortAddress = '0x1234'
      expect(formatAddress(shortAddress)).toBe(shortAddress)
    })

    it('should handle empty addresses', () => {
      expect(formatAddress('')).toBe('')
    })
  })

  describe('formatTimeAgo', () => {
    const now = Date.now()

    it('should format seconds correctly', () => {
      const timestamp = now - 30 * 1000
      expect(formatTimeAgo(timestamp)).toBe('30s ago')
    })

    it('should format minutes correctly', () => {
      const timestamp = now - 5 * 60 * 1000
      expect(formatTimeAgo(timestamp)).toBe('5m ago')
    })

    it('should format hours correctly', () => {
      const timestamp = now - 3 * 60 * 60 * 1000
      expect(formatTimeAgo(timestamp)).toBe('3h ago')
    })

    it('should format days correctly', () => {
      const timestamp = now - 2 * 24 * 60 * 60 * 1000
      expect(formatTimeAgo(timestamp)).toBe('2d ago')
    })

    it('should handle string timestamps', () => {
      const timestamp = (now - 30 * 1000).toString()
      expect(formatTimeAgo(timestamp)).toBe('30s ago')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(25.5)).toBe('25.50%')
      expect(formatPercentage(100)).toBe('100.00%')
    })

    it('should respect custom decimal places', () => {
      expect(formatPercentage(25.555, 1)).toBe('25.6%')
      expect(formatPercentage(25.555, 3)).toBe('25.555%')
    })
  })

  describe('generateColor', () => {
    it('should generate consistent colors for same seed', () => {
      const color1 = generateColor('test')
      const color2 = generateColor('test')
      expect(color1).toBe(color2)
    })

    it('should generate different colors for different seeds', () => {
      const color1 = generateColor('test1')
      const color2 = generateColor('test2')
      expect(color1).not.toBe(color2)
    })

    it('should return HSL format', () => {
      const color = generateColor('test')
      expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/)
    })
  })

  describe('copyToClipboard', () => {
    beforeEach(() => {
      // Mock navigator.clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn(),
        },
      })
    })

    it('should copy text successfully', async () => {
      const mockWriteText = navigator.clipboard.writeText as jest.Mock
      mockWriteText.mockResolvedValue(undefined)

      const result = await copyToClipboard('test text')
      expect(result).toBe(true)
      expect(mockWriteText).toHaveBeenCalledWith('test text')
    })

    it('should handle copy failures', async () => {
      const mockWriteText = navigator.clipboard.writeText as jest.Mock
      mockWriteText.mockRejectedValue(new Error('Copy failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await copyToClipboard('test text')

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('formatBlockNumber', () => {
    it('should format block numbers correctly', () => {
      expect(formatBlockNumber(1234567)).toBe('#1,234,567')
      expect(formatBlockNumber(1000)).toBe('#1,000')
      expect(formatBlockNumber(1)).toBe('#1')
    })
  })

  describe('calculatePercentageChange', () => {
    it('should calculate positive percentage change', () => {
      expect(calculatePercentageChange(110, 100)).toBe(10)
    })

    it('should calculate negative percentage change', () => {
      expect(calculatePercentageChange(90, 100)).toBe(-10)
    })

    it('should handle zero previous value', () => {
      expect(calculatePercentageChange(100, 0)).toBe(0)
    })

    it('should handle same values', () => {
      expect(calculatePercentageChange(100, 100)).toBe(0)
    })
  })
})
