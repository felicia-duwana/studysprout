import { useState, useEffect, useCallback } from "react"
import { apiPath } from "../api"

const useSessions = () => {
    const [sessions, setSessions] = useState([])

    const fetchSessions = useCallback(() => {
        const token = localStorage.getItem("token")
        fetch(apiPath("/api/v1/sessions/all"), {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(data => setSessions(data.sessions || []))
    }, [])

    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    return { sessions, fetchSessions }
}

export default useSessions