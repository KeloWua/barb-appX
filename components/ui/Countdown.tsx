import { useEffect, useMemo, useState } from 'react'
import { Text } from 'react-native'

type CountdownProps = {
    expiresAt: string | null | undefined
    onExpire: () => void
}

export const Countdown = ({ expiresAt, onExpire }: CountdownProps) => {

    const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

    useEffect(() => {
        if (!expiresAt) return

        const tick = () => {
            const diff = new Date(expiresAt).getTime() - Date.now()
            setSecondsLeft(Math.max(0, Math.floor(diff / 1000)))
        }

        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [expiresAt])

    const countdownLabel = useMemo(() => {
        if (secondsLeft === null) return null
        const m = Math.floor(secondsLeft / 60)
        const s = secondsLeft % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }, [secondsLeft])

    useEffect(() => {
        if (secondsLeft === 0) {
            onExpire()
        }
    }, [secondsLeft, onExpire])

    return (
        <Text className='text-amber-600 font-bold text-sm mb-6'>
            Reservado por {countdownLabel} min
        </Text>
    )
}