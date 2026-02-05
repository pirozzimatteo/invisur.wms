import { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { itemService } from '../../services/api';
import type { Item } from '../../types';

interface ItemAutocompleteProps {
    value: string | null;  // The internalCode (or ID if preferred, but current flow uses Code)
    onChange: (newValue: string | null, item?: Item | null) => void;
    label?: string;
    error?: boolean;
    helperText?: string;
}

export default function ItemAutocomplete({ value, onChange, label = "Item Code", error, helperText }: ItemAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;

        if (!open) {
            return undefined;
        }

        (async () => {
            setLoading(true);
            try {
                // Ideally backend supports search query. For now, fetch all.
                // Optimization for later: search endpoint.
                const response = await itemService.getAll();
                if (active) {
                    setOptions(response.data);
                }
            } catch (err) {
                console.error("Failed to load items", err);
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [open]);

    // Derive selected option from string value
    const selectedValue = options.find(o => o.internalCode === value) || null;

    return (
        <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            isOptionEqualToValue={(option, val) => option.internalCode === val.internalCode}
            getOptionLabel={(option) => `${option.internalCode} - ${option.description}`}
            options={options}
            loading={loading}
            value={selectedValue}
            onChange={(_, newValue: Item | null) => {
                onChange(newValue ? newValue.internalCode : null, newValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    error={error}
                    helperText={helperText}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
}
