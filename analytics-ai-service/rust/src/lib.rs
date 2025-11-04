use pyo3::prelude::*;
use regex::Regex;

/// Clean SQL generation result by removing markdown fences, quotes and semicolons,
/// and normalizing whitespaces. Mirrors Python implementation semantics closely.
#[pyfunction]
fn clean_generation_result(result: &str) -> PyResult<String> {
    // Normalize whitespace (collapse multiple spaces/newlines to single space)
    let whitespace_re = Regex::new(r"\s+").unwrap();
    let mut s = whitespace_re.replace_all(result, " ").to_string();

    // Remove known code fences / quotes / trailing semicolons
    for pat in [
        "```sql",
        "```json",
        "\"\"\"",
        "'''",
        "```",
        ";",
    ] {
        s = s.replace(pat, "");
    }

    Ok(s.trim().to_string())
}

/// Remove trailing LIMIT <n> (case-insensitive) similar to Python regex
#[pyfunction]
fn remove_limit_statement(sql: &str) -> PyResult<String> {
    // (?i)\s*LIMIT\s+\d+(\s*;?\s*--.*|\s*;?\s*)$
    let re = Regex::new(r"(?i)\s*LIMIT\s+\d+(\s*;?\s*--.*|\s*;?\s*)$").unwrap();
    Ok(re.replace(sql, "").to_string())
}

/// Add quotes by replacing backticks with double quotes.
/// Keep signature parity: returns (quoted_sql, error_message).
/// Note: For now we do not parse/validate SQL here; error_message is empty on success.
#[pyfunction]
fn add_quotes(sql: &str) -> PyResult<(String, String)> {
    let quoted = sql.replace('`', "\"");
    Ok((quoted, String::new()))
}

/// Python module definition
#[pymodule]
fn analytics_rust_core(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(clean_generation_result, m)?)?;
    m.add_function(wrap_pyfunction!(remove_limit_statement, m)?)?;
    m.add_function(wrap_pyfunction!(add_quotes, m)?)?;
    Ok(())
}






