export function StudioSetup() {
  return (
    <div className="container page-shell empty-state" role="status">
      <p className="eyebrow">Studio setup required</p>
      <h1>Connect Sanity to open the editorial Studio.</h1>
      <p>
        This site is still using its safe local-content mode. A project administrator
        can follow <code>docs/SANITY_SETUP.md</code> to configure this route without
        putting credentials in the repository.
      </p>
    </div>
  );
}
