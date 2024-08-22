from dagster import (
    AssetExecutionContext,
    Definitions,
    PipesSubprocessClient,
    asset,
)

# here the asset is generated in-line
# but you could also generate via asset factories


@asset(
    # add other useful metadata
    compute_kind="typescript",
    owners=["elt_team@company.com"],
    tags={"dagster/storage_kind": "snowflake", "typescript_file": "helloWorld.ts"},
)
def my_asset(
    context: AssetExecutionContext,
    pipes_subprocess_client: PipesSubprocessClient,
):
    """Runs our ELT pipeline written in typescript"""
    cmd = [
        "npx",
        "ts-node",
        "src/helloWorld.ts",
    ]

    context.log.info(f"Will run command {cmd}")

    return pipes_subprocess_client.run(
        command=cmd,
        context=context.op_execution_context,
        extras={"total_count": 10},
    ).get_materialize_result()


defs = Definitions(
    assets=[my_asset],
    resources={"pipes_subprocess_client": PipesSubprocessClient()},
)
