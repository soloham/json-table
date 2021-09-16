# JSON Table Editor

![JSON Table Editor ](documentation/example.png)

# Usage

- JSON Table can be invoked from the context menu of a JSON file, by choosing "JSON Table Editor" in the Open With options
- The grid can ne sorted, filtered and can be edited inline.
- This currently only works on JSON files with an array and finds the first property that's an array to display in the table

Demonstrates [JSON Table Editor](https://github.com/SoloHam/json-table) using a custom editor:

## Version 0.0.5

- Fixed issue with empty table upon initial load

## Version 0.0.4

- Drastically reduced package size

## Version 0.0.3

- Fixed issue with empty screen when switching tabs
- Column headers are now sticky
- Improved search input styling

## Version 0.0.2 (Initial Release)

- Provides a custom editor for `.json` files
- Currently, it extracts the first element from the JSON that is an array
- The JSON Table Editor can be invoked from the context menu of a JSON file, by choosing "JSON Table Editor" in the Open With options
- The table supports sorting, filtering and inline editing
- Clicking the plus icon will add a new row at the bottom of the table, the new row is a copy of the last element