# Command Palette Feature

A command palette is a powerful UI pattern that allows users to quickly access features and navigate through the application using keyboard shortcuts. This document outlines the implementation of a command palette in our application.

## Features

- **Keyboard Shortcut**: `⌘K` (Mac) or `Ctrl+K` (Windows)
- **Quick Actions**
- **Recent Items**
- **Search Functionality**

## Implementation Example

```tsx
// Command palette actions
const commands = [
  {
    name: 'Create New Prompt',
    icon: Plus,
    action: () => router.push('/prompts/create'),
    shortcut: '⌘K',
  },
  {
    name: 'Browse Community',
    icon: Users,
    action: () => router.push('/prompts/community'),
    shortcut: '⌘B',
  },
  {
    name: 'View Drafts',
    icon: Clock,
    action: () => setActiveTab('draft'),
    shortcut: '⌘D',
  },
  {
    name: 'View Published',
    icon: Star,
    action: () => setActiveTab('published'),
    shortcut: '⌘P',
  },
];

// Command Palette Component
<Dialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
  <DialogContent className="overflow-hidden p-0">
    <Command>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {commands.map((command) => (
            <CommandItem
              key={command.name}
              onSelect={() => {
                command.action();
                setShowCommandPalette(false);
              }}
            >
              <command.icon className="mr-2 h-4 w-4" />
              <span>{command.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {command.shortcut}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Recent Prompts">
          {prompts.slice(0, 5).map((prompt) => (
            <CommandItem
              key={prompt.id}
              onSelect={() => {
                router.push(`/prompts/${prompt.id}`);
                setShowCommandPalette(false);
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>{prompt.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  </DialogContent>
</Dialog>
```

## Keyboard Shortcut Implementation

```tsx
useEffect(() => {
  const down = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setShowCommandPalette((open) => !open);
    }
  };
  document.addEventListener('keydown', down);
  return () => document.removeEventListener('keydown', down);
}, []);
```

## Required Dependencies

```bash
yarn add cmdk @radix-ui/react-dialog
```

## Components Used

- `Command`: Main container for the command palette
- `CommandInput`: Search input field
- `CommandList`: Container for search results
- `CommandGroup`: Groups related commands
- `CommandItem`: Individual command items
- `CommandEmpty`: Shown when no results are found
- `Dialog`: Modal container for the command palette

## Future Enhancements

1. **Command Categories**
   - Group commands by functionality
   - Add visual separators between categories

2. **Search Improvements**
   - Fuzzy search
   - Search through command descriptions
   - Search through prompt content

3. **Keyboard Navigation**
   - Arrow key navigation
   - Number shortcuts for quick selection
   - Custom keyboard shortcuts

4. **UI Enhancements**
   - Command history
   - Favorite commands
   - Command suggestions based on usage

5. **Integration Features**
   - Global command palette
   - Context-aware commands
   - Command aliases

## Best Practices

1. **Performance**
   - Lazy load command items
   - Debounce search input
   - Cache recent commands

2. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

3. **UX Considerations**
   - Clear command names
   - Intuitive shortcuts
   - Visual feedback
   - Loading states

## Implementation Notes

- The command palette should be implemented after the MVP phase
- Consider adding it as a global feature accessible from any page
- Ensure it doesn't interfere with existing keyboard shortcuts
- Test thoroughly across different browsers and devices 