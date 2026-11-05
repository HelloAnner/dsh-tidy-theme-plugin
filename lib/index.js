/**
 * Host half of `dsh-tidy-theme-plugin`.
 *
 * The plugin only changes browser presentation, so the Loader row still needs a
 * Node-side entry: this empty `apply` gives the profile a host plugin seat while
 * the browser half ships through `exports["./client"]` and `dsh.client`.
 */
export function apply() {}
