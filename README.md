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

## Multiple Selector

```
import { MultipleSelector } from "d2-ui-components";

const MyMultipleSelector = () =>
    <MultiSelector
        d2={d2}
        height={300}
        onChange={values => console.log("New selected values", values)}
        options={[{text: "Option 1", value: "id1"}, {text: "Option 2", value: "id2"}]}
        selected={["id1"]}
        ordered={true}
    />
```

## Simple checkbox

Visually similar to material-ui checkbox but much lighter, useful when you have lots of checks in a page.


```
import { SimpleCheckBox } from "d2-ui-components";

const MySimpleCheckBox = () =>
    <SimpleCheckBox
        checked={true}
        onClick={values => console.log("Checkbox was clicked")}
    />
```

# Setup

```
$ yarn install
```

Run tests, linter and prettier:

```
$ yarn code-quality
```

## i18n

We use `@dhis2/i18n` for the internationalization, with translations added to the namespace `d2-ui-components`.
Within this package, all components should import [src/utils/i18n.js](src/utils/i18n.js) and use
`i18n.t("Some literal")`, which uses the correct namespace.

### Update an existing language

```
$ yarn update-po
# ... add/edit translations in po files ...
$ yarn localize
```

### Create a new language

```
$ cp i18n/en.pot i18n/es.po
# ... add translations to i18n/es.po ...
$ yarn localize
```
