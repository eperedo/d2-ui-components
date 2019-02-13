# Introduction

## Setup

```
$ yarn install
```

## Development

When developing your app, init the link in this repository:

```
$ yarn link
```

And then link it wherever you want to use the package:

```
$ cd /path/to/my/project/using-d2-ui-components
$ yarn link d2-ui-components
```

When you want to change code in the components, run this command to build the package on any change:

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
