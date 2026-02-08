import {
  Input,
  Checkbox,
  Radio,
  Switch,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';

export function FormsSection() {
  return (
    <section className="bg-surface-variant py-24 text-on-surface-variant">
      <div className="container mx-auto px-6 space-y-8">
        <h2 className="text-2xl font-semibold border-b border-outline pb-2">
          Forms & Inputs
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-on-surface-variant">
                Text Inputs
              </h3>
              <div className="grid gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium">
                    Default
                  </label>
                  <Input type="email" id="email" placeholder="Email" />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label htmlFor="hover" className="text-sm font-medium">
                    Hovered
                  </label>
                  <Input
                    type="text"
                    id="hover"
                    placeholder="Hovered state"
                    className="border-outline-variant"
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label htmlFor="focused" className="text-sm font-medium">
                    Focused
                  </label>
                  <Input
                    type="text"
                    id="focused"
                    placeholder="Focused state"
                    className="ring-2 ring-primary ring-offset-2 border-primary"
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label
                    htmlFor="error"
                    className="text-sm font-medium text-error"
                  >
                    Error
                  </label>
                  <Input
                    type="text"
                    id="error"
                    placeholder="Error state"
                    error
                  />
                  <p className="text-xs text-error">Invalid email address.</p>
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label
                    htmlFor="success"
                    className="text-sm font-medium text-success"
                  >
                    Success
                  </label>
                  <Input
                    type="text"
                    id="success"
                    placeholder="Success state"
                    success
                    defaultValue="Valid Input"
                  />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <label htmlFor="disabled" className="text-sm font-medium">
                    Disabled
                  </label>
                  <Input
                    disabled
                    type="text"
                    id="disabled"
                    placeholder="Disabled"
                  />
                </div>
              </div>
            </div>

            {/* Select */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-on-surface-variant">
                Select
              </h3>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label htmlFor="fruit" className="text-sm font-medium">
                  Select a fruit
                </label>
                <Select>
                  <SelectTrigger id="fruit">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-on-surface-variant">
                Checkboxes
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Accept terms and conditions
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="disabled-checked" disabled defaultChecked />
                  <label
                    htmlFor="disabled-checked"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Disabled Checked
                  </label>
                </div>
              </div>
            </div>

            {/* Radio Group */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-on-surface-variant">
                Radio Buttons
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center space-x-2">
                  <Radio id="option-1" name="options" value="1" />
                  <label
                    htmlFor="option-1"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Option One
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Radio id="option-2" name="options" value="2" />
                  <label
                    htmlFor="option-2"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Option Two
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-on-surface-variant">
                Switches
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="airplane-mode" />
                  <label
                    htmlFor="airplane-mode"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Airplane Mode
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="wifi" defaultChecked />
                  <label
                    htmlFor="wifi"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Wi-Fi
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="disabled-switch" disabled />
                  <label
                    htmlFor="disabled-switch"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Disabled
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
