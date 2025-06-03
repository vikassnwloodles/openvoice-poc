import {useState} from 'react';
import axios from axios;


export default function  Main() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState<string>('')
    const [speed, setSpeed] = useState<number>(float(1.0))
    const [language, setLanguage] = useState<string>('en')

    const handleSubmit = (e: any) => {
        e.preventDefault();

    }
}