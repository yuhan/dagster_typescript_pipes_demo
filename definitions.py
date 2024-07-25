import shutil

from dagster import (
    AssetCheckExecutionContext,
    AssetCheckResult,
    Definitions,
    PipesSubprocessClient,
    AssetExecutionContext,
    asset,
    file_relative_path,
)

# here the asset is generated in-line
# but you could also generate via asset factories

@asset(
    # add other useful metadata
    compute_kind="typescript",
    owners=["elt_team@company.com"],
    tags={
        "dagster/storage_kind": "snowflake",
        "typescript_file": "helloWorld.ts"
    },
)
def my_asset(
    context: AssetExecutionContext, 
    pipes_subprocess_client: PipesSubprocessClient,
):
    """ Runs our ELT pipeline written in typescript"""
    cmd = [
        shutil.which("node"),
        file_relative_path(__file__, "dist/helloWorld.js"),
    ]

    context.log.info(f"Will run command {cmd}")

    return pipes_subprocess_client.run(
        command=cmd, context=context.op_execution_context
    ).get_materialize_result()


defs = Definitions(
    assets=[my_asset],
    resources={"pipes_subprocess_client": PipesSubprocessClient()},
)