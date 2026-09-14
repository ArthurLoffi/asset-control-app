// @vitest-environment jsdom
import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import {afterEach, expect, it, vi} from 'vitest';
import {useResourceForm} from './use-resource-form';
import {formText} from './resource';

afterEach(cleanup);

it('prevents duplicate submissions and returns the generated record', async () => {
    const record = {id: 42, name: 'Saved'};
    let complete!: (value: typeof record) => void;
    const api = {
        create: vi.fn(
            async (_input: {name: string}) =>
                // ES2023 does not include Promise.withResolvers.
                // eslint-disable-next-line unicorn/prefer-promise-with-resolvers
                new Promise<typeof record>((resolve) => {
                    complete = resolve;
                }),
        ),
        update: vi.fn(async (_id: number, _input: {name: string}) => record),
    };
    const onSaved = vi.fn();

    function Form() {
        const model = useResourceForm({
            api,
            onSaved(value) {
                onSaved(value);
            },
            parse: (data) => ({input: {name: formText(data, 'name')}}),
            fallbackError: 'Failed',
        });
        return (
            <form
                aria-label="Record form"
                onSubmit={(event) => {
                    void model.handleSubmit(event);
                }}
            >
                <input name="name" defaultValue="Saved" />
                <button type="submit" disabled={model.saving}>
                    Save
                </button>
            </form>
        );
    }

    render(<Form />);
    const form = screen.getByRole('form', {name: 'Record form'});
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(api.create).toHaveBeenCalledTimes(1);
    expect(api.update).not.toHaveBeenCalled();
    expect(
        screen.getByRole<HTMLButtonElement>('button', {name: 'Save'}).disabled,
    ).toBe(true);
    await act(async () => {
        complete(record);
    });
    await waitFor(() => {
        expect(onSaved).toHaveBeenCalledWith(record);
    });
    expect(
        screen.getByRole<HTMLButtonElement>('button', {name: 'Save'}).disabled,
    ).toBe(false);
});
