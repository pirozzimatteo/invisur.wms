import { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { locationService } from '../../services/api';
import type { Location } from '../../types';

interface LocationAutocompleteProps {
    value: string | null; // Location Code
    onChange: (newValue: string | null, location?: Location | null) => void;
    label?: string;
    error?: boolean;
    helperText?: string;
}

export default function LocationAutocomplete({ value, onChange, label = "Location", error, helperText }: LocationAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let active = true;

        if (!open) {
            return undefined;
        }

        (async () => {
            setLoading(true);
            try {
                const response = await locationService.getAll();
                if (active) {
                    setOptions(response.data);
                }
            } catch (err) {
                console.error("Failed to load locations", err);
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [open]);

    const selectedValue = options.find(o => o.code === value) || null;

    return (
        <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            isOptionEqualToValue={(option, val) => option.code === val.code}
            getOptionLabel={(option) => `${option.code} (${option.type})`}
            options={options}
            loading={loading}
            value={selectedValue}
            onChange={(_, newValue: Location | null) => {
                onChange(newValue ? newValue.code : null, newValue);
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
