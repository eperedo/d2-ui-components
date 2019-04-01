import React from "react";
import { mount } from "enzyme";
import { DatePicker } from "../DatePicker";

it("shows label", () => {
    const onChange = jest.fn();
    const datePicker = mount(<DatePicker label="My label" onChange={onChange} />);

    expect(datePicker.text()).toContain("My label");
});

export {};
