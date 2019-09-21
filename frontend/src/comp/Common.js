import React from 'react';
import Button from '@material-ui/core/Button';

export function DefaultButton(props) {
    return(
        <Button variant="contained" color="primary" style={{marginTop: '1em'}}
            {...props}>
        </Button>
    )
}
