import { useState, useEffect, useCallback } from "react"

const useSessions = () => {
    const [sessions, setSessions] = useState([])

    const fetchSessions = useCallback(() => {
        const token = localStorage.getItem("token")
        fetch("http://localhost:4000/api/v1/sessions/all", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => setSessions(data.sessions))
    }, [])

    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    return { sessions, fetchSessions }
}

export default useSessions