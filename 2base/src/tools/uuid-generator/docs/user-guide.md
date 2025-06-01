# UUID Generator - User Guide

## Quick Start

The UUID Generator helps you create universally unique identifiers for your projects. Simply select your preferred UUID version and format, then click "Generate" to create new UUIDs.

### Basic Usage

1. **Choose UUID Version**:
   - **v4 Random** (default): Best for general use
   - **v1 Time**: Includes timestamp information
   - **v7 Unix**: Latest standard with Unix timestamp

2. **Select Format**:
   - **Standard**: `550e8400-e29b-41d4-a716-446655440000`
   - **Uppercase**: `550E8400-E29B-41D4-A716-446655440000`
   - **No Hyphens**: `550e8400e29b41d4a716446655440000`
   - **Braces**: `{550e8400-e29b-41d4-a716-446655440000}`

3. **Set Quantity**: Choose how many UUIDs to generate (1-100)

4. **Generate**: Click the generate button or press Space

## Features

### UUID Versions

#### v4 Random (Recommended)
- **Use Case**: General-purpose unique identifiers
- **Characteristics**: Cryptographically secure random numbers
- **Example**: `f47ac10b-58cc-4372-a567-0e02b2c3d479`

#### v1 Time-based
- **Use Case**: When timestamp information is needed
- **Characteristics**: Based on MAC address and timestamp
- **Example**: `12345678-1234-1234-1234-123456789abc`

#### v7 Unix Timestamp
- **Use Case**: Modern applications requiring sortable UUIDs
- **Characteristics**: Unix timestamp prefix with random suffix
- **Example**: `01851234-5678-7abc-def0-123456789abc`

### Output Formats

#### Standard Format
- Uses lowercase letters and hyphens
- Most widely supported format
- Example: `550e8400-e29b-41d4-a716-446655440000`

#### Uppercase Format
- Same as standard but with uppercase letters
- Required by some legacy systems
- Example: `550E8400-E29B-41D4-A716-446655440000`

#### No Hyphens Format
- Compact format without separators
- Useful for URLs or databases
- Example: `550e8400e29b41d4a716446655440000`

#### Braces Format
- Wrapped in curly braces
- Common in Microsoft technologies
- Example: `{550e8400-e29b-41d4-a716-446655440000}`

### Batch Generation

Generate multiple UUIDs at once:

1. **Set Quantity**: Use the number input (1-100)
2. **Generate**: All UUIDs are created simultaneously
3. **Copy All**: Use the "Copy All" button or Ctrl+C
4. **Individual Copy**: Click the copy icon next to each UUID

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Generate UUIDs |
| `Ctrl+C` / `Cmd+C` | Copy all UUIDs |
| `Ctrl+Enter` / `Cmd+Enter` | Generate UUIDs |
| `Escape` | Clear results |

## Copy Functionality

### Individual Copy
- Click the copy icon next to any UUID
- The UUID is copied to your clipboard
- Visual feedback confirms the copy action

### Copy All
- Use the "Copy All" button
- All generated UUIDs are copied as a newline-separated list
- Useful for bulk operations

### Copy Format
When copying multiple UUIDs, they are formatted as:
```
550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
6ba7b811-9dad-11d1-80b4-00c04fd430c8
```

## Use Cases

### Software Development
- Database primary keys
- Session identifiers
- API request tracking
- File naming
- Object identification

### System Administration
- Configuration identifiers
- Log correlation IDs
- Service instance IDs
- Deployment tracking

### Data Management
- Record linking
- Data migration
- Import/export operations
- Backup identification

## Best Practices

### Version Selection
- **v4 Random**: Use for most applications
- **v1 Time**: Use when you need temporal ordering
- **v7 Unix**: Use for modern applications requiring sortable IDs

### Format Selection
- **Standard**: Use unless specific requirements exist
- **Uppercase**: Use for legacy system compatibility
- **No Hyphens**: Use for compact storage or URLs
- **Braces**: Use for Microsoft ecosystem integration

### Security Considerations
- UUIDs are generated client-side only
- No data is sent to external servers
- Use v4 for maximum unpredictability

## Troubleshooting

### Common Issues

#### Copy Not Working
- **Solution**: Check browser permissions for clipboard access
- **Alternative**: Manual selection and copy (Ctrl+C)

#### Generation Slow
- **Cause**: Large batch sizes (>50)
- **Solution**: Use smaller batches for faster generation

#### Invalid Format Display
- **Cause**: Browser compatibility issues
- **Solution**: Try a different browser or update current browser

### Browser Support

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |

### Performance Tips

1. **Large Batches**: Generate in chunks of 25-50 for optimal performance
2. **Clear Results**: Clear previous results before generating new batches
3. **Memory Usage**: Be mindful when generating 100+ UUIDs repeatedly

## Integration Examples

### JavaScript/TypeScript
```javascript
// Copy the UUID and use in your code
const userId = "550e8400-e29b-41d4-a716-446655440000"
const user = { id: userId, name: "John Doe" }
```

### Database SQL
```sql
-- PostgreSQL with UUID type
INSERT INTO users (id, name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'John Doe');

-- MySQL with CHAR(36)
INSERT INTO users (id, name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'John Doe');
```

### Configuration Files
```yaml
# YAML configuration
service:
  id: 550e8400-e29b-41d4-a716-446655440000
  name: user-service
```

---

**Need Help?** If you encounter any issues or have questions, refer to the [API Reference](./api-reference.md) for technical details or check the [troubleshooting section](#troubleshooting) above. 