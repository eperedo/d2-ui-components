# Components

## Dialog Handler

A button that opens a modal info dialog when clicked.

```
import { Icon, IconButton } from "@material-ui/core";
import { DialogHandler } from "d2-ui-components";

const MyDialogHandler = () => (
    <DialogHandler
        title="Help"
        contents="This is some help message"
        buttonComponent={
            ({ onClick }) => (
                <IconButton tooltip="Help" onClick={onClick}>
                    <Icon color="primary">help</Icon>
                </IconButton>
            )
        }
    />
);
```

## Date Picker

```
import { DatePicker } from "d2-ui-components";

const MyDatePicker = () => (
    <DatePicker
        label="Label of the TextInput component"
        value={new Date("2019/01/30")}
        onChange={newValue => console.log(newValue)}
    />
);
```

## Multiple Selector

```
import { MultipleSelector } from "d2-ui-components";

const MyMultipleSelector = () => (
    <MultiSelector
        d2={d2}
        height={300}
        onChange={values => console.log("New selected values", values)}
        options={[{text: "Option 1", value: "id1"}, {text: "Option 2", value: "id2"}]}
        selected={["id1"]}
        ordered={true}
    />
);
```

## Simple checkbox

Visually similar to material-ui checkbox but much lighter, useful when you have lots of checks in a page.

```
import { SimpleCheckBox } from "d2-ui-components";

const MySimpleCheckBox = () => (
    <SimpleCheckBox
        checked={true}
        onClick={values => console.log("Checkbox was clicked")}
    />
);
```

## Organisation Units selector

```
import { OrgUnitsSelector }  from "d2-ui-components";

const MyOrgUnitsSelector = () => (
    <OrgUnitsSelector
        d2={d2}
        onChange={orgUnitsPaths => console.log("Selected orgUnitPaths", orgUnitsPaths)}
        selected={["/ImspTQPwCqd/O6uvpzGd5pu", "/ImspTQPwCqd/PMa2VCrupOd"]}
        levels={[1, 2]}
    />
);
```

# Snackbar feedback

There should be a unique snackbar for the whole app, so we need to insert a single provider in the main component:

```
import { SnackbarProvider }  from "d2-ui-components";

const MyAppWithSnackbar = (
    <SnackbarProvider>
        <MyApp />
    </SnackbarProvider>
);
```

To use it, create a HOC with `withSnackbar`, add `snackbar` to your propTypes, and show messages using the functions `props.snackbar[.level]`. Levels supported: _success_, _error_, _info_, _warning_.

```
import { withSnackbar } from "d2-ui-components";
import PropTypes from "prop-types";

const MyComponent = ({name, snackbar}) => (
    <div>
        <a onClick={() => snackbar.success(name)}>Success</a>
        <a onClick={() => snackbar.error(name)}>Error</a>
        <a onClick={() => snackbar.info(name)}>Info</a>
        <a onClick={() => snackbar.warning(name)}>Warning</a>
    </div>
);

MyComponent.propTypes = {
    name: PropTypes.object.isRequired,
    snackbar: PropTypes.object.isRequired,
}

export default withSnackbar(MyComponent);
```

# Loading Mask

There should be a unique loading mask for the whole app, so we need to insert a single provider in the main component:

```
import { LoadingProvider }  from "d2-ui-components";

const MyAppWithLoadingMask = (
    <LoadingProvider>
        <MyApp />
    </LoadingProvider>
);
```

To use it, create a HOC with `withLoading`, add `loading` to your propTypes, and show the mask using the functions `props.loading.show()`.

```
import { withLoading } from "d2-ui-components";
import PropTypes from "prop-types";

const MyComponent = ({name, loading}) => (
    <div>
        <a onClick={() => loading.show()}>Show loading mask</a>
        <a onClick={() => loading.show(false)}>Hide loading mask</a>
        <a onClick={() => loading.show(true, 'Message', 35)}>Show loading mask with extra information</a>
        <a onClick={() => loading.updateMessage('String')}>Update message</a>
        <a onClick={() => loading.updateProgress(98)}>Update progress</a>
    </div>
);

MyComponent.propTypes = {
    name: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
}

export default withLoading(MyComponent);
```

## Objects table

Display D2 objects in a table with:

-   Sortable columns.
-   Filters: By default, it shows a search bar to filter by name, custom filters can be added.
-   Details sidebar.
-   Configurable context actions.
-   Pagination.
-   _Create_ button action.

```
const columns = [
    { name: "displayName", text: i18n.t("Name"), sortable: true },
    { name: "publicAccess", text: i18n.t("Public access"), sortable: true },
    { name: "lastUpdated", text: i18n.t("Last updated"), sortable: true },
];

const detailsFields = [
    { name: "displayName", text: i18n.t("Name") },
    { name: "code", text: i18n.t("Code") },
    { name: "href", text: i18n.t("API link") },
];

const actions = [
    {
        name: "details",
        text: i18n.t("Details"),
        multiple: false,
        type: "details",
    },
    {
        name: "delete",
        text: i18n.t("Delete"),
        multiple: true,
    },
];

const CustomFilters = (
    <Checkbox ... />
);

const MyObjectsTable = () => (
    <ObjectsTable
        d2={d2}
        model={d2.models.dataSet}
        columns={columns}
        detailsFields={detailsFields}
        pageSize={20}
        initialSorting={["displayName", "asc"]}
        actions={actions}
        onCreate={true}
        list={list} // list(d2, filters, pagination) -> {pager, objects}
        customFiltersComponent={CustomFilters}
        customFilters={{key1: "value1", key2: "value2}}
    />
);
```

# Setup

```
$ yarn install
```

Run tests, linter and prettier:

```
$ yarn code-quality
```

To publish a new package to npmjs:

```
$ yarn build && yarn publish build/
```

## i18n

We use `@dhis2/i18n` with namespace `d2-ui-components`. Within this package, all components
should import [src/utils/i18n.js](src/utils/i18n.js) and use
`i18n.t("Some literal")`, which wraps the original i18n object with namespace `d2-ui-components`.

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
