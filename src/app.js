import axios from 'axios';
import _ from 'lodash';
import spawn from 'cross-spawn';
import micromatch from 'micromatch';
import { useQuery } from '@tanstack/react-query';

// --- 1. Axios (Potential HTTP Response Splitting / SSRF) ---
// Vulnerable version 1.13.5 has issues with header merging.
const fetchData = async (userInputHeader) => {
  return await axios.get('https://api.example.com/data', {
    headers: {
      'X-Custom-Header': userInputHeader // Vulnerable to CRLF injection
    }
  });
};

// --- 2. Lodash (Prototype Pollution / ReDoS) ---
// Version 4.17.15 is famous for CVE-2020-28500.
const processData = (input) => {
  // Triggers ReDoS if 'input' is a very long string of specific characters
  return _.trim(input); 
};

// --- 3. Cross-Spawn (ReDoS) ---
// Version 7.0.3 is vulnerable to CVE-2024-21538.
const runCommand = (cmdArgs) => {
  // If cmdArgs contains a malicious long string, it crashes the CPU
  spawn('ls', [cmdArgs]);
};

// --- 4. Micromatch (ReDoS) ---
// Version 4.0.5 is vulnerable to CVE-2024-4067 via .braces().
const checkFiles = (pattern) => {
  // Malicious patterns like '{' repeated 10,000 times will hang the process
  return micromatch.braces(pattern);
};

// --- 5. React Query (Frontend State) ---
// Standard usage for TanStack Query.
export function MyComponent() {
  const { data } = useQuery({
    queryKey: ['test'],
    queryFn: () => fetchData('normal-header')
  });
  return <div>{JSON.stringify(data)}</div>;
}

console.log("App logic initialized with vulnerable dependencies.");
