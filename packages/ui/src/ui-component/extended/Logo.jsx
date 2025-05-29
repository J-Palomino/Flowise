import { useSelector } from 'react-redux'

// ==============================|| LOGO ||============================== //

import { headerHeight } from '@/store/constant'

const Logo = () => {
    const height = headerHeight || 80 // fallback to 80 if not defined

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '1.5px solid #000',
                overflow: 'hidden',
                marginLeft: '10px',
                marginBlockEnd: '10px',
                height: height - 15,
                width: height - 15
            }}
        >
            <img
                style={{ objectFit: 'contain', height: '100%', width: '100%' }}
                src={'/daisy.png'}
                alt='Daisy'
            />
        </div>
    )
}

export default Logo
