import React from "react";
import { mount } from "enzyme";
import { DatePicker } from "../DatePicker";

it("shows label", () => {
    const onChange = jest.fn();
    const datePicker = mount(
        <DatePicker value={new Date(2019, 1, 2)} label="My label" onChange={onChange} />
    );

    expect(datePicker.find("label").text()).toContain("My label");
});

export {};
