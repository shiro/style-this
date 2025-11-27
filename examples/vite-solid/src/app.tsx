import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { Suspense } from "solid-js";
import { config } from "~/config";
import { routes } from "~/routes";

export default function App() {
  return (
    <MetaProvider>
      <Router
        base={config.base}
        root={(props) => {
          return (
            <>
              <Title>Example</Title>
              <Meta name="description" content="test app" />
              <div class="content-container">
                <Suspense>{props.children}</Suspense>
              </div>
            </>
          );
        }}
      >
        {routes}
      </Router>
    </MetaProvider>
  );
}
