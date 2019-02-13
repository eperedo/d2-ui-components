# Introduction

## Setup

```
$ yarn install
```

When developing your app, you will need a link:

```
$ yarn link
```

```
$ cd /path/to/my/project/using-d2-ui-components
$ yarn link d2-ui-components
```

## Development

Build the package on any change of sources:

```
$ yarn build-dev
```

Run tests, linter and prettier:

```
$ yarn code-quality
```

# Components

## Date Picker

```
import { DatePicker } from "d2-ui-components";

const MyDatePicker = () =>
    <DatePicker
        label="Label of the TextInput component"
        value={new Date("2019/01/30")}
        onChange={newValue => console.log(newValue)}
    />
```
